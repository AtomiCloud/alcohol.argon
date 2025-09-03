import { type IdTokenClaims, LogtoContext, type UserInfoResponse } from '@logto/next';

interface TokenSet {
  idToken: string;
  accessTokens: Record<string, string>;
}

interface AuthData {
  tokenSet: TokenSet;
  claims: IdTokenClaims;
  userInfo: UserInfoResponse;
}

interface AuthState {
  isAuthenticated: boolean;
  authData?: AuthData;
}

export type { TokenSet, AuthState, AuthData };
