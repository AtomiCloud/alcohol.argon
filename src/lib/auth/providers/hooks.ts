import type { IdTokenClaims, UserInfoResponse } from '@logto/next';
import type { AuthData, AuthState, TokenSet } from '@/lib/auth/core/types';
import type { ResultSerial } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import type { OptionSerial } from '@/lib/monads/option';
import useSWR from 'swr';

type FetcherArgs = [input: RequestInfo | URL, init?: RequestInit];

type Content<T, Y> = ResultSerial<OptionSerial<T>, Y>;

const fetcher = async <T extends AuthData>(url: string): Promise<ResultSerial<AuthState<T>, Problem>> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json<ResultSerial<AuthState<T>, Problem>>();
};

function useUserInfo(initial?: AuthState<UserInfoResponse>): Content<AuthState<UserInfoResponse>, Problem> {
  const { data, isLoading, error } = useSWR<ResultSerial<AuthState<UserInfoResponse>, Problem>>(
    '/api/auth/user',
    fetcher,
    {
      fallbackData: initial ? ['ok', initial] : undefined,
    },
  );
  if (isLoading) return ['ok', [false, null]];
  if (error) return ['err', error];
  // biome-ignore lint/style/noNonNullAssertion: this is not null
  const [type, value] = data!;
  if (type === 'err') return ['err', value];
  return [type, [true, value]];
}

function useClaims(initial?: AuthState<IdTokenClaims>): Content<AuthState<IdTokenClaims>, Problem> {
  const { data, isLoading, error } = useSWR<ResultSerial<AuthState<IdTokenClaims>, Problem>>(
    '/api/auth/claims',
    fetcher,
    {
      fallbackData: initial ? ['ok', initial] : undefined,
    },
  );
  if (isLoading) return ['ok', [false, null]];
  if (error) return ['err', error];
  // biome-ignore lint/style/noNonNullAssertion: this is not null
  const [type, value] = data!;
  if (type === 'err') return ['err', value];
  return [type, [true, value]];
}

function useTokens(initial?: AuthState<TokenSet>): Content<AuthState<TokenSet>, Problem> {
  const { data, isLoading, error } = useSWR<ResultSerial<AuthState<TokenSet>, Problem>>('/api/auth/tokens', fetcher, {
    fallbackData: initial ? ['ok', initial] : undefined,
  });
  if (isLoading) return ['ok', [false, null]];
  if (error) return ['err', error];
  // biome-ignore lint/style/noNonNullAssertion: this is not null
  const [type, value] = data!;
  if (type === 'err') return ['err', value];
  return [type, [true, value]];
}

export { useUserInfo, useClaims, useTokens };
