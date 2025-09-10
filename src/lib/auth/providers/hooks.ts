// import type { AuthState } from '@/lib/auth/core/types';
//
// type FetcherArgs = [input: RequestInfo | URL, init?: RequestInit];
//
// // biome-ignore lint/suspicious/noExplicitAny: Generic fetcher needs to handle any JSON response type
// const fetcher = async (...arg: FetcherArgs): Promise<> => {
//   const response = await fetch(...arg);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   return await response.json();
// };
//
// // function useAuth(): ResultSerial<OptionSerial<AuthState>, unknown> {
// //   const [exist, initial] = useInitialAuthState();
// //
// //   const { data, isLoading, error } = useSWR<AuthState>('/api/auth/state', fetcher, {
// //     refreshInterval: 5000,
// //     fallbackData: exist ? initial : undefined,
// //   });
// //   if (isLoading) return ['ok', [false, null]];
// //   if (error) return ['err', error];
// //   // biome-ignore lint/style/noNullAssertion: data is not null once error.
// //   return ['ok', [true, data!]];
// // }
// //
// // export { useAuth };
