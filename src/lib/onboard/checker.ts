import type { IAuthStateRetriever, TokenSet } from '@/lib/auth/core/types';
import type { Problem, ProblemRegistry } from '@/lib/problem/core';
import { Err, Ok, Res, type Result } from '@/lib/monads/result';
import type { AuthChecker } from '@/lib/auth/core/checker';
import type { AdaptedProblemDefinition } from '@/adapters/external/core';

type OnBoardFix = 'verify_email' | 'set_username' | 'set_email' | 'setup_config';

type OnboardResult = Result<true, OnBoardFix>;

class OnboardChecker {
  constructor(
    private readonly retriever: IAuthStateRetriever,
    private readonly problemRegistry: ProblemRegistry<AdaptedProblemDefinition>,
    private readonly check: AuthChecker,
    private readonly api: Record<
      string,
      {
        creator: (idToken: string, accessToken: string) => Result<unknown, Problem>;
      }
    >,
  ) {}

  get targets(): string[] {
    return Object.keys(this.api);
  }

  isActive(accessToken: string, target: string): boolean {
    const token = this.check.toToken(accessToken);
    return (token[target.replace('-', '_')] as string | undefined) === 'true';
  }

  hasConfig(accessToken: string): boolean {
    const token = this.check.toToken(accessToken);
    return (
      token.configuration_id != null && typeof token.configuration_id === 'string' && token.configuration_id.length > 0
    );
  }

  usernameExist(idToken: string): boolean {
    const token = this.check.toToken(idToken);
    return token.username != null && typeof token.username === 'string' && token.username.length > 0;
  }

  emailExist(idToken: string): boolean {
    const token = this.check.toToken(idToken);
    return token.email != null && typeof token.email === 'string' && token.email.length > 0;
  }

  emailVerified(idToken: string): boolean {
    const token = this.check.toToken(idToken);
    return token.email_verified != null && typeof token.email_verified === 'boolean' && token.email_verified;
  }

  listInactive(tokenSet: TokenSet, check: string[]): string[] {
    return check.filter(target => !this.isActive(tokenSet.accessTokens[target], target));
  }

  onboard(guard: 'public' | 'private'): Result<OnboardResult, Problem> {
    const success = Ok(Ok<true, OnBoardFix>(true));
    const unauthorized = Err<OnboardResult, Problem>(this.problemRegistry.createProblem('unauthorized', {}));

    return this.retriever.getTokenSet().andThen(tokens => {
      if (tokens.value.isAuthed) {
        const tokenSet = tokens.value.data;
        const idToken = tokens.value.data.idToken;
        // if no verified or username empty, we have to request a fix
        if (!this.emailExist(idToken)) return Ok(Err<true, OnBoardFix>('set_email'));
        if (!this.usernameExist(idToken)) return Ok(Err<true, OnBoardFix>('set_username'));
        if (!this.emailVerified(idToken)) return Ok(Err<true, OnBoardFix>('verify_email'));

        const inactive = this.listInactive(tokenSet, this.targets);
        if (inactive.length === 0) {
          // Check if config exists for alcohol-zinc via access token claim
          if (this.api['alcohol-zinc'] && !this.hasConfig(tokenSet.accessTokens['alcohol-zinc'])) {
            // Try to refresh token once in case backend just created config
            return this.retriever.forceTokenSet().andThen(refreshedState => {
              if (refreshedState.value.isAuthed) {
                // Check again after refresh
                if (!this.hasConfig(refreshedState.value.data.accessTokens['alcohol-zinc'])) {
                  return Ok(Err<true, OnBoardFix>('setup_config'));
                }
                return success;
              }
              // If logged out during refresh, treat as unauthorized
              return guard === 'private' ? unauthorized : success;
            });
          }
          return success;
        }

        return (
          Res.all(...inactive.map(target => this.api[target].creator(idToken, tokenSet.accessTokens[target])))
            .mapErr(x => x[0])
            // here, we are refetching the access token, since after creating, API server should update Auth server on active scope
            .andThen(_ => this.retriever.forceTokenSet())
            .andThen(state => {
              if (state.value.isAuthed) {
                const inactive = this.listInactive(state.value.data, this.targets);
                // somehow, after API server update auth server, the active scope is not reflected here
                if (inactive.length > 0)
                  throw new Error(
                    `Failed to update API servers despite all API calls succeeded. Failed: ${JSON.stringify(inactive)}`,
                  );

                // Check if config exists for alcohol-zinc via access token claim
                if (this.api['alcohol-zinc'] && !this.hasConfig(state.value.data.accessTokens['alcohol-zinc'])) {
                  return Ok(Err<true, OnBoardFix>('setup_config'));
                }

                return success;
              }
              // if this happens, somehow user logged out during this refetched access tokens
              throw new Error('Logged out upon for token refresh');
            })
        );
      }
      return guard === 'private' ? unauthorized : success;
    });
  }
}

export { OnboardChecker };
export type { OnboardResult, OnBoardFix };
