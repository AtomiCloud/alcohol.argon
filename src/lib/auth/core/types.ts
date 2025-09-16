import type { IdTokenClaims, UserInfoResponse } from '@logto/next';
import type { DU } from '@/lib/monads/discrimminated-union.i';
import type { Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

interface TokenSet {
  idToken: string;
  accessTokens: Record<string, string>;
}

type AllState = {
  tokens: TokenSet;
  claims: IdTokenClaims;
  user: UserInfoResponse;
};
type AuthData = TokenSet | IdTokenClaims | UserInfoResponse | AllState;

type AuthStateAuthed<T extends AuthData> = { isAuthed: true; data: T };
type AuthStateUnauthed = { isAuthed: false };
type AuthState<T extends AuthData> = DU<[['authed', AuthStateAuthed<T>], ['unauthed', AuthStateUnauthed]]>;

interface IAuthStateRetriever {
  forceTokenSet(): Result<AuthState<TokenSet>, Problem>;

  getTokenSet(): Result<AuthState<TokenSet>, Problem>;

  getClaims(): Result<AuthState<IdTokenClaims>, Problem>;

  getUserInfo(): Result<AuthState<UserInfoResponse>, Problem>;

  getStates(): Result<AuthState<AllState>, Problem>;
}

export type { TokenSet, AuthData, AuthState, AllState, IAuthStateRetriever };
