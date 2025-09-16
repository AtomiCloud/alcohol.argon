import type { IncomingMessage, ServerResponse } from 'node:http';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type LogtoClient from '@logto/next';
import type { IdTokenClaims, UserInfoResponse } from '@logto/next';
import type { AllState, AuthData, AuthState, IAuthStateRetriever, TokenSet } from '@/lib/auth/core/types';
import type { Problem } from '@/lib/problem/core';
import { Ok, Res, type Result } from '@/lib/monads/result';
import type { AuthChecker } from '@/lib/auth/core/checker';
import { None, type Option, Some } from '@/lib/monads/option';

type Req = IncomingMessage & { cookies: NextApiRequestCookies };
type Resp = ServerResponse;
type NodeClient = Awaited<ReturnType<LogtoClient['createNodeClientFromNextApi']>>;

class ServerAuthStateRetriever implements IAuthStateRetriever {
  private nodeClientCache: Option<NodeClient> = None();

  constructor(
    private readonly client: LogtoClient,
    private readonly authChecker: AuthChecker,
    private readonly resources: Record<string, string>,
    private readonly req: Req,
    private readonly res: Resp,
    private token: Option<TokenSet> = None(),
  ) {}

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
    return Res.async(async (): Promise<Result<AuthState<TokenSet>, Problem>> => {
      this.token = None();
      const client = await this.getNodeClient();
      await client.clearAccessToken();
      const r = await this.fetchTokenSet();
      return Ok({ __kind: 'authed', value: { isAuthed: true, data: r } } satisfies AuthState<TokenSet>);
    });
  }

  getClaims(): Result<AuthState<IdTokenClaims>, Problem> {
    return this.getState(() => this.fetchClaims());
  }

  getTokenSet(): Result<AuthState<TokenSet>, Problem> {
    return this.getState(() => this.cacheOrFetchTokenSet());
  }

  getUserInfo(): Result<AuthState<UserInfoResponse>, Problem> {
    return this.getState(() => this.fetchUserInfo());
  }

  private getState<T extends AuthData>(getter: () => Promise<T>): Result<AuthState<T>, Problem> {
    return Res.async(async (): Promise<Result<AuthState<T>, Problem>> => {
      const auth = await this.getNodeClient();
      const authed = await auth.isAuthenticated();
      if (!authed) return Ok({ __kind: 'unauthed', value: { isAuthed: false } } satisfies AuthState<T>);
      const data = await getter();
      return Ok({ __kind: 'authed', value: { isAuthed: true, data } } satisfies AuthState<T>);
    });
  }

  private async getNodeClient() {
    const client = await this.nodeClientCache.unwrapOr(() =>
      this.client.createNodeClientFromNextApi(this.req, this.res),
    );
    this.nodeClientCache = Some(client);
    return client;
  }

  private async fetchClaims(): Promise<IdTokenClaims> {
    const auth = await this.getNodeClient();
    return auth.getIdTokenClaims();
  }

  private async fetchUserInfo(): Promise<UserInfoResponse> {
    const auth = await this.getNodeClient();
    return this.req.user?.userInfo ? this.req.user.userInfo : await auth.fetchUserInfo();
  }

  private async cacheOrFetchTokenSet(): Promise<TokenSet> {
    let r = await this.token.unwrapOr(() => this.fetchTokenSet());
    if (this.authChecker.stateNeedRefresh(r)) r = await this.fetchTokenSet();
    this.token = Some(r);
    return r;
  }

  private async fetchTokenSet(): Promise<TokenSet> {
    const auth = await this.getNodeClient();

    const accessTokensPromise = Promise.all(
      Object.entries(this.resources).map(async ([k, v]) => [k, await auth.getAccessToken(v)] as [string, string]),
    ).then(entries => Object.fromEntries(entries));
    const idTokenPromise = auth.getIdToken().then(idToken => idToken as string);

    const [accessTokens, idToken] = await Promise.all([accessTokensPromise, idTokenPromise]);
    return { idToken, accessTokens };
  }
}

export { ServerAuthStateRetriever };
