import type { AllState, AuthData, AuthState, IAuthStateRetriever, TokenSet } from '@/lib/auth/core/types';
import { None, type Option, Some } from '@/lib/monads/option';
import { Ok, Res, type Result, type ResultSerial } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import type { AuthChecker } from '@/lib/auth/core/checker';
import type { IdTokenClaims, UserInfoResponse } from '@logto/next';

class ClientAuthStateRetriever implements IAuthStateRetriever {
  #tokenSetCache: Option<AuthState<TokenSet>> = None();
  #userInfoCache: Option<AuthState<UserInfoResponse>> = None();
  #idClaimsCache: Option<AuthState<IdTokenClaims>> = None();

  constructor(private readonly authChecker: AuthChecker) {}

  getStates(): Result<AuthState<AllState>, Problem> {
    const tokenSetR = this.getTokenSet();
    const userInfoR = this.getUserInfo();
    const claimsR = this.getClaims();
    return Res.all(tokenSetR, userInfoR, claimsR)
      .andThen((x): Result<AuthState<AllState>, Problem[]> => {
        const [tokenSetState, userInfoState, claimsState] = x as [
          AuthState<TokenSet>,
          AuthState<UserInfoResponse>,
          AuthState<IdTokenClaims>,
        ];
        if (tokenSetState.value.isAuthed && userInfoState.value.isAuthed && claimsState.value.isAuthed) {
          return Ok({
            __kind: 'authed',
            value: {
              isAuthed: true,
              data: {
                tokens: tokenSetState.value.data,
                claims: claimsState.value.data,
                user: userInfoState.value.data,
              },
            },
          } satisfies AuthState<AllState>);
        }
        return Ok({ __kind: 'unauthed', value: { isAuthed: false } } satisfies AuthState<AllState>);
      })
      .mapErr(x => x[0]);
  }

  forceTokenSet(): Result<AuthState<TokenSet>, Problem> {
    this.#tokenSetCache = None();
    return this.getTokenSet();
  }

  private fetch<T extends AuthData>(endpoint: string): Result<AuthState<T>, Problem> {
    return Res.fromSerial<AuthState<T>, Problem>(fetch(endpoint).then(res => res.json()));
  }

  private cacheOrFetch<T extends AuthData>(
    cache: Option<AuthState<T>>,
    endpoint: string,
  ): Result<AuthState<T>, Problem> {
    return Res.fromAsync(cache.map(x => Ok<AuthState<T>, Problem>(x)).unwrapOr(() => this.fetch<T>(endpoint)));
  }

  getClaims(): Result<AuthState<IdTokenClaims>, Problem> {
    return this.cacheOrFetch(this.#idClaimsCache, '/api/auth/claims').run(claims => {
      this.#idClaimsCache = Some(claims);
    });
  }

  getUserInfo(): Result<AuthState<UserInfoResponse>, Problem> {
    return this.cacheOrFetch(this.#userInfoCache, '/api/auth/user').run(user => {
      this.#userInfoCache = Some(user);
    });
  }

  getTokenSet(): Result<AuthState<TokenSet>, Problem> {
    return this.cacheOrFetch(this.#tokenSetCache, '/api/auth/tokens')
      .andThen(x =>
        x.value.isAuthed && this.authChecker.stateNeedRefresh(x.value.data)
          ? this.fetch<TokenSet>('/api/auth/tokens')
          : Ok(x),
      )
      .run(tokens => {
        this.#tokenSetCache = Some(tokens);
      });
  }
}

export { ClientAuthStateRetriever };
