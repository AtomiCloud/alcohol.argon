import type { IdTokenClaims, UserInfoResponse } from '@logto/next';
import type { DU } from '@/lib/monads/discrimminated-union.i';
import type { Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

interface TokenSet {
  idToken: string;
  accessTokens: Record<string, string>;
}

type AuthData = TokenSet | IdTokenClaims | UserInfoResponse;

type AuthStateAuthed<T extends AuthData> = { isAuthed: true; data: T };
type AuthStateUnauthed = { isAuthed: false };
type AuthState<T extends AuthData> = DU<[['authed', AuthStateAuthed<T>], ['unauthed', AuthStateUnauthed]]>;

interface IAuthStateRetriever {
  getTokenSet(): Result<AuthState<TokenSet>, Problem>;

  getClaims(): Result<AuthState<IdTokenClaims>, Problem>;

  getUserInfo(): Result<AuthState<UserInfoResponse>, Problem>;
}

export type { TokenSet, AuthData, AuthState, IAuthStateRetriever };
