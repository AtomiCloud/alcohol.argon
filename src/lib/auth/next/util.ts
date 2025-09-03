import type { IncomingMessage, ServerResponse } from 'node:http';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type LogtoClient from '@logto/next';
import type { AuthState } from '@/lib/auth/core/types';

type Req = IncomingMessage & { cookies: NextApiRequestCookies };
type Res = ServerResponse;

class AuthManager {
  constructor(
    private readonly client: LogtoClient,
    private readonly resources: Record<string, string>,
  ) {}

  async getAuthState(req: Req, res: Res): Promise<AuthState> {
    const auth = await this.client.createNodeClientFromNextApi(req, res);
    const isAuthenticated = await auth.isAuthenticated();

    if (isAuthenticated) {
      const accessTokensPromise = Promise.all(
        Object.entries(this.resources).map(async ([k, v]) => [k, await auth.getAccessToken(v)] as [string, string]),
      ).then(entries => Object.fromEntries(entries));
      const idTokenPromise = auth.getIdToken().then(idToken => idToken as string);

      const userInfoPromise = auth.fetchUserInfo();
      const claimsPromise = auth.getIdTokenClaims();

      const [accessTokens, idToken, userInfo, claims] = await Promise.all([
        accessTokensPromise,
        idTokenPromise,
        userInfoPromise,
        claimsPromise,
      ]);
      return {
        isAuthenticated: true,
        authData: {
          claims,
          userInfo,
          tokenSet: { accessTokens, idToken },
        },
      };
    }
    return { isAuthenticated: false };
  }
}

export { AuthManager };
