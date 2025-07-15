import type { Result } from '@/lib/monads/result';
import { Ok, Err } from '@/lib/monads/result';
import type { Problem, SwaggerApiResponse } from './types';
import type { ProblemTransformer } from './transformer';

/**
 * Maps HTTP responses from swagger-typescript-api to Result<T, Problem>
 */
export class HttpResponseMapper {
  constructor(private transformer: ProblemTransformer) {}

  /**
   * Map a swagger-typescript-api response to Result<T, Problem>
   */
  mapResponse<T>(response: SwaggerApiResponse<T>, instance?: string): Result<T, Problem> {
    // Success case - data is present and not null
    if (response.data !== null && response.error === null) {
      return Ok(response.data as T);
    }

    // Error case - error is present
    if (response.error !== null) {
      const problem = this.transformer.fromUnknown(response.error, instance);
      return Err(problem);
    }

    // Edge case - both data and error are null
    if (response.data && response.error) {
      const problem = this.transformer.fromUnknown(
        new Error('Invalid response: both data and error are null'),
        instance,
      );
      return Err(problem);
    }

    // Fallback - should not reach here in normal cases
    return Ok(response.data as T);
  }

  /**
   * Map a fetch Response to Result<T, Problem>
   */
  async mapFetchResponse<T>(response: Response, instance?: string): Promise<Result<T, Problem>> {
    try {
      // Check if response is ok
      if (!response.ok) {
        const body = await response.text();
        const httpError = {
          status: response.status,
          statusText: response.statusText,
          body,
          headers: this.headersToObject(response.headers),
          url: response.url,
        };

        const problem = this.transformer.fromHttpError(httpError, instance);
        return Err(problem);
      }

      // Try to parse JSON response
      const data = (await response.json()) as T;
      return Ok(data);
    } catch (error) {
      const problem = this.transformer.fromUnknown(error, instance);
      return Err(problem);
    }
  }

  /**
   * Map an axios error to Result<T, Problem>
   */
  mapAxiosError<T>(error: unknown, instance?: string): Result<T, Problem> {
    // Type guard for axios error structure
    const isAxiosError = (
      err: unknown,
    ): err is { response?: unknown; request?: unknown; config?: unknown; message?: string } => {
      return typeof err === 'object' && err !== null;
    };

    if (!isAxiosError(error)) {
      const problem = this.transformer.fromUnknown(error, instance);
      return Err(problem);
    }

    // Axios error structure
    if (error.response && typeof error.response === 'object' && error.response !== null) {
      const response = error.response as { status: number; statusText: string; data: unknown; headers: unknown };
      // Server responded with error status
      const httpError = {
        status: response.status,
        statusText: response.statusText,
        body: JSON.stringify(response.data),
        headers: response.headers as Record<string, string> | undefined,
        url: (error.config as { url?: string })?.url,
      };

      const problem = this.transformer.fromHttpError(httpError, instance);
      return Err(problem);
    }

    if (error.request) {
      // Request was made but no response received
      const message = typeof error.message === 'string' ? error.message : 'Network error';
      const problem = this.transformer.fromUnknown(new Error(`Network error: ${message}`), instance);
      return Err(problem);
    }

    // Something else happened
    const problem = this.transformer.fromUnknown(error, instance);
    return Err(problem);
  }

  /**
   * Convert Headers object to plain object
   */
  private headersToObject(headers: Headers): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
}
