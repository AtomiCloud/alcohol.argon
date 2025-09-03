import useSWR from 'swr';
import type { AuthState } from '@/lib/auth/core/types';
import { useInitialAuthState } from '@/lib/auth/providers/Provider';

type FetcherArgs = [input: RequestInfo | URL, init?: RequestInit];

// biome-ignore lint/suspicious/noExplicitAny: Generic fetcher needs to handle any JSON response type
const fetcher = async (...arg: FetcherArgs): Promise<any> => {
  const response = await fetch(...arg);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

function useAuth(): AuthState {
  const initialState = useInitialAuthState();
  const { data } = useSWR<AuthState>('/api/auth/state', fetcher, {
    refreshInterval: 60000,
    fallbackData: initialState,
  });
  return data ?? { isAuthenticated: true };
}

export { useAuth };
