import type { AuthState, IAuthStateRetriever, TokenSet } from '@/lib/auth/core/types';
import type { Problem } from '@/lib/problem/core';
import { Err, Ok, Res, type Result } from '@/lib/monads/result';
import type { UserInfoResponse } from '@logto/next';
import type { AuthChecker } from '@/lib/auth/core/checker';

type Fix = 'verify_email' | 'set_username' | 'set_email';

type OnboardResult = Result<AuthState<UserInfoResponse>, Fix>;

class OnboardChecker {
  constructor(
    private readonly retriever: IAuthStateRetriever,
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

  usernameExist(idToken: string): boolean {
    const token = this.check.toToken(idToken);
    return token.username != null && typeof token.username === 'string' && token.username.length > 0;
  }

  emailExist(idToken: string): boolean {
    const token = this.check.toToken(idToken);
    return (
      token.email != null && typeof token.email === 'string' && token.email.length > 0 && token.email.includes('!!')
    );
  }

  emailVerified(idToken: string): boolean {
    const token = this.check.toToken(idToken);
    return token.email_verified != null && typeof token.email_verified === 'boolean' && token.email_verified;
  }

  listInactive(tokenSet: TokenSet, check: string[]): string[] {
    return check.filter(target => !this.isActive(tokenSet.accessTokens[target], target));
  }

  onboard(): Result<OnboardResult, Problem> {
    return this.retriever.getTokenSet().andThen(tokens => {
      if (tokens.value.isAuthed) {
        const tokenSet = tokens.value.data;
        const idToken = tokens.value.data.idToken;

        // if no verified or username empty, we have to request a fix
        if (!this.emailExist(idToken)) return Ok(Err<AuthState<UserInfoResponse>, Fix>('set_email'));
        if (!this.usernameExist(idToken)) return Ok(Err<AuthState<UserInfoResponse>, Fix>('set_username'));
        if (!this.emailVerified(idToken)) return Ok(Err<AuthState<UserInfoResponse>, Fix>('verify_email'));

        const success = this.retriever.getUserInfo().map(user => Ok<AuthState<UserInfoResponse>, Fix>(user));

        const inactive = this.listInactive(tokenSet, this.targets);
        if (inactive.length === 0) return success;

        return (
          Res.all(...inactive.map(target => this.api[target].creator(idToken, tokenSet.accessTokens[target])))
            .mapErr(x => x[0])
            // here, we are refetching the access token, since after creating, API server should update Auth server on active scope
            .andThen(_ => this.retriever.forceTokenSet())
            .andThen(state => {
              if (state.value.isAuthed) {
                const inactive = this.listInactive(state.value.data, this.targets);
                // somehow, after API server update auth server, the active scope is not refected here
                if (inactive.length > 0)
                  throw new Error(
                    `Failed to update API servers despite all API calls succeeded. Failed: ${JSON.stringify(inactive)}`,
                  );

                return success;
              }
              // if this happens, somehow user logged out during this refetched access tokens
              throw new Error('Logged out upon for token refresh');
            })
        );
      }
      return Ok(Ok<AuthState<UserInfoResponse>, Fix>({ __kind: 'unauthed', value: { isAuthed: false } }));
    });
  }
}

export { OnboardChecker };
