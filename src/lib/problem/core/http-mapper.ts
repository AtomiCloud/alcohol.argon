import type { Result } from '@/lib/monads/result';
import { Ok, Err } from '@/lib/monads/result';
import type { HttpErrorDetails, Problem, SwaggerApiResponse } from './types';
import type { ProblemTransformer } from './transformer';
import { defaultContentTypeRegistry, type ContentTypeParserRegistry } from '../utils/content-type-parser';

/**
 * Maps HTTP responses from swagger-typescript-api to Result<T, Problem>
 */
export class HttpResponseMapper {
  constructor(
    private transformer: ProblemTransformer,
    private contentTypeRegistry: ContentTypeParserRegistry = defaultContentTypeRegistry,
  ) {}

  /**
   * Map a swagger-typescript-api response to Result<T, Problem>
   */
  mapResponse<T>(response: SwaggerApiResponse<T>, instance?: string): Result<T, Problem> {
    // if response has error, return Err(problem)
    if (response.error) {
      const problem = this.transformer.fromUnknown(response.error, instance);
      return Err(problem);
    }

    // if response has data, return Ok(data). data can be null
    return Ok(response.data as T);
  }

  /**
   * Map a fetch Response to Result<T, Problem>
   * Supports multiple content types: JSON, YAML, XML, TOML, form data, plain text
   */
  async mapFetchResponse<T>(response: Response, instance?: string): Promise<Result<T, Problem>> {
    try {
      // Check if response is ok
      if (!response.ok) {
        const body = await response.text();
        const httpError: HttpErrorDetails = {
          status: response.status,
          statusText: response.statusText,
          body,
          headers: this.headersToObject(response.headers),
          url: response.url,
        };

        const problem = await this.transformer.fromHttpError(httpError, instance);
        return Err(problem);
      }

      const contentType = response.headers.get('content-type') || 'application/json';
      const body = await response.text();

      // Use content-type parser to parse the response
      const parseResult = this.contentTypeRegistry.parse<T>(body, contentType);

      return parseResult.match({
        ok: data => Ok(data),
        err: parseError => {
          const problem = this.transformer.fromUnknown(
            new Error(`Failed to parse ${contentType} response: ${parseError.message}`),
            instance,
          );
          return Err(problem);
        },
      });
    } catch (error) {
      const problem = this.transformer.fromUnknown(error, instance);
      return Err(problem);
    }
  }

  /**
   * Map an axios error to Result<T, Problem>
   */
  async mapAxiosError<T>(error: unknown, instance?: string): Promise<Result<T, Problem>> {
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
      const response = error.response as {
        status: number;
        statusText: string;
        data: unknown;
        headers: Record<string, string> | undefined;
      };

      // Try to serialize response data based on content type
      let body: string;
      const contentType = response.headers?.['content-type'] || 'application/json';

      if (typeof response.data === 'string') {
        body = response.data;
      } else {
        // Use content-type parser to serialize
        const serializeResult = this.contentTypeRegistry.serialize(response.data, contentType);
        body = await serializeResult.match({
          ok: (serialized: string) => serialized,
          err: () => JSON.stringify(response.data),
        });
      }

      const httpError: HttpErrorDetails = {
        status: response.status,
        statusText: response.statusText,
        body,
        headers: response.headers,
        url: (error.config as { url?: string })?.url,
      };

      const problem = await this.transformer.fromHttpError(httpError, instance);
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
