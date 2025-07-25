/**
 * Generic adapter for swagger-typescript-api generated clients
 *
 * Transforms API client method calls to return Result<T, Problem> instead of throwing errors.
 * Automatically detects and preserves RFC 7807 Problem Details in error responses.
 */

import { Ok, Err, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem';
import type { ProblemTransformer } from '@/lib/problem/core/transformer';

/**
 * Type for any async function (API client method)
 */
type AsyncFunction<TArgs extends unknown[], TReturn> = (...args: TArgs) => Promise<TReturn>;

/**
 * Configuration for the swagger adapter
 */
export interface SwaggerAdapterConfig {
  /** Instance identifier for problem details */
  instance?: string;
  /** Problem transformer for handling errors */
  problemTransformer?: ProblemTransformer;
}

/**
 * Wraps a swagger-typescript-api client method to return Result<T, Problem>
 *
 * @param apiMethod - The API client method to wrap
 * @param config - Optional configuration for error handling
 * @returns Wrapped method that returns Result<T, Problem>
 *
 * @example
 * ```typescript
 * const safeUserList = wrapApiMethod(zincApi.api.vUserList);
 * const result = await safeUserList({ version: '1.0' });
 *
 * result.match({
 *   ok: users => console.log('Users:', users),
 *   err: problem => console.error('Problem:', problem.detail)
 * });
 * ```
 */
export function wrapApiMethod<TArgs extends unknown[], TReturn>(
  apiMethod: AsyncFunction<TArgs, TReturn>,
  config: SwaggerAdapterConfig = {},
): (...args: TArgs) => Promise<Result<TReturn, Problem>> {
  const { instance = 'unknown', problemTransformer } = config;

  return async (...args: TArgs): Promise<Result<TReturn, Problem>> => {
    try {
      const result = await apiMethod(...args);
      return Ok(result);
    } catch (error) {
      let problem: Problem;
      if (problemTransformer) {
        problem = await problemTransformer.fromSwaggerError(error, instance);
      } else {
        // Fallback for when no transformer is provided
        problem = {
          type: 'about:blank',
          title: 'API Error',
          status: 500,
          detail: error instanceof Error ? error.message : String(error),
          instance,
        };
      }
      return Err(problem);
    }
  };
}

/**
 * Creates a proxy that automatically wraps all methods of an API client
 *
 * @param apiClient - The swagger-typescript-api client instance
 * @param config - Optional configuration for error handling
 * @returns Proxied client where all methods return Result<T, Problem>
 *
 * @example
 * ```typescript
 * const zincApi = new AlcoholZincApi({ baseUrl: 'https://api.example.com' });
 * const safeZincApi = createSafeApiClient(zincApi);
 *
 * // All methods now return Result<T, Problem>
 * const userResult = await safeZincApi.api.vUserList({ version: '1.0' });
 * const rootResult = await safeZincApi.getRoot();
 * ```
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic API client requires any type
export function createSafeApiClient<T extends Record<string, any>>(
  apiClient: T,
  config: SwaggerAdapterConfig = {},
): SafeApiClient<T> {
  // biome-ignore lint/suspicious/noExplicitAny: Cache must store any value type
  const cache = new Map<string | symbol, any>();

  // biome-ignore lint/suspicious/noExplicitAny: Proxy wrapper requires any types
  function wrapObject(obj: any, path: string[] = []): any {
    return new Proxy(obj, {
      get(target, prop) {
        const value = target[prop];
        const currentPath = [...path, String(prop)];

        // Return cached wrapper if it exists
        if (cache.has(prop)) {
          return cache.get(prop);
        }

        // If it's a function, wrap it
        if (typeof value === 'function') {
          const wrappedMethod = wrapApiMethod(value.bind(target), config);
          cache.set(prop, wrappedMethod);
          return wrappedMethod;
        }

        // If it's an object (like api.vUserList), recursively wrap it
        if (value && typeof value === 'object' && value !== target) {
          const wrappedObject = wrapObject(value, currentPath);
          cache.set(prop, wrappedObject);
          return wrappedObject;
        }

        // Return primitive values as-is
        return value;
      },
    });
  }

  return wrapObject(apiClient) as SafeApiClient<T>;
}

/**
 * Type transformation that converts all async methods to return Result<T, Problem>
 */
type SafeApiClient<T> = {
  [K in keyof T]: T[K] extends AsyncFunction<infer Args, infer Return>
    ? (...args: Args) => Promise<Result<Return, Problem>>
    : // biome-ignore lint/suspicious/noExplicitAny: Generic type constraint requires any
      T[K] extends Record<string, any>
      ? SafeApiClient<T[K]>
      : T[K];
};

export type { SafeApiClient };
