import type { Problem, ProblemConfig, HttpErrorDetails } from './types';
import { isProblem } from './types';
import { defaultContentTypeRegistry, type ContentTypeParserRegistry } from '../utils/content-type-parser';
import type { ProblemRegistry } from './registry';
import type { HttpErrorContext } from '@/problems/definitions/http-error';
import type { LocalErrorContext } from '@/problems/definitions/local-error';

/**
 * Interface for error reporting functionality (e.g., Faro, Sentry, etc.)
 */
export interface ErrorReporter {
  pushError(error: Error, context?: Record<string, unknown>): void;
}

/**
 * Core transformer class for converting errors to RFC 7807 Problems
 * Designed to be DI-compatible - only handles library catch-all problems
 */
export class ProblemTransformer {
  constructor(
    private config: ProblemConfig,
    // biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for flexibility
    private problemRegistry: ProblemRegistry<any>,
    private errorReporter: ErrorReporter,
    private contentTypeRegistry: ContentTypeParserRegistry = defaultContentTypeRegistry,
  ) {}

  /**
   * Report error to configured error reporter
   */
  private reportError(error: Error, context?: Record<string, unknown>): void {
    try {
      this.errorReporter.pushError(error, context);
    } catch (e) {
      // Silently fail if error reporting fails
      console.debug('Failed to report error:', e);
    }
  }

  /**
   * Transform a native Error to a Problem (library catch-all)
   */
  fromError(error: Error, additionalDetail?: string, instance?: string): Problem {
    // Report to error reporter
    this.reportError(error, {
      additionalDetail,
      instance,
      transformer: 'ProblemTransformer.fromError',
    });

    // Create problem using registry
    const localErrorContext: LocalErrorContext = {
      errorName: error.constructor.name,
      errorMessage: error.message,
      stackTrace: error.stack,
      context: additionalDetail || 'Error transformation',
    };

    return this.problemRegistry.createProblem('local_error', localErrorContext, undefined, instance);
  }

  /**
   * Transform HTTP error details to a Problem (library catch-all)
   * Supports multiple content types for parsing response body
   */
  async fromHttpError(details: HttpErrorDetails, additionalDetail?: string, instance?: string): Promise<Problem> {
    // Report to error reporter
    const httpError = new Error(`HTTP ${details.status} ${details.statusText}: ${details.body}`);
    this.reportError(httpError, {
      url: details.url,
      status: details.status,
      statusText: details.statusText,
      additionalDetail,
      instance,
      transformer: 'ProblemTransformer.fromHttpError',
    });

    // Try to parse body using content-type aware parser
    let bodyData: unknown = null;
    if (details.body) {
      // Determine content type from headers
      const contentType = details.headers?.['content-type'] || 'application/json';

      // Try to parse with appropriate parser
      const parseResult = this.contentTypeRegistry.parse(details.body, contentType);
      bodyData = await parseResult.match({
        ok: parsed => parsed,
        err: () => details.body, // Fallback to raw body if parsing fails
      });
    }

    // If the parsed body is already a problem, preserve it with additional context
    if (isProblem(bodyData)) {
      let detail = bodyData.detail;
      if (additionalDetail) {
        detail = `${detail}. ${additionalDetail}`;
      }

      return {
        ...bodyData,
        detail: `${detail} (Original HTTP ${details.status}: ${details.statusText})`,
        instance: instance || bodyData.instance,
        // Preserve original problem data
        _originalProblem: bodyData,
        _httpContext: {
          status: details.status,
          statusText: details.statusText,
          headers: details.headers,
          url: details.url,
        },
      };
    }

    // Create problem using registry
    const httpErrorContext: HttpErrorContext = {
      statusCode: details.status,
      responseBody: details.body?.trim() || undefined,
      url: details.url,
    };

    return this.problemRegistry.createProblem('http_error', httpErrorContext, undefined, instance);
  }

  /**
   * Transform unknown error to a Problem (library catch-all)
   */
  fromUnknown(error: unknown, additionalDetail?: string, instance?: string): Problem {
    // If it's already a problem, return as-is (but add additional detail if provided)
    if (isProblem(error)) {
      if (additionalDetail) {
        return {
          ...error,
          detail: `${error.detail}. ${additionalDetail}`,
        };
      }
      return error;
    }

    // If it's an Error object, use fromError (which handles Faro reporting)
    if (error instanceof Error) {
      return this.fromError(error, additionalDetail, instance);
    }

    // Report non-Error objects to error reporter as synthetic errors
    const syntheticError = new Error(typeof error === 'string' ? error : 'Unknown error occurred');
    this.reportError(syntheticError, {
      originalError: error,
      errorType: typeof error,
      additionalDetail,
      instance,
      transformer: 'ProblemTransformer.fromUnknown',
    });

    // If it's a string
    if (typeof error === 'string') {
      let detail = error;
      if (additionalDetail) {
        detail = `${detail}. ${additionalDetail}`;
      }

      return {
        type: this.buildTypeUri('unknown_error'),
        title: 'Unknown Error',
        status: 500,
        detail,
        instance,
      };
    }

    // If it's an object, try to extract useful information
    if (error && typeof error === 'object') {
      const obj = error as Record<string, unknown>;
      let detail = obj.message?.toString() || 'An unknown error occurred';
      if (additionalDetail) {
        detail = `${detail}. ${additionalDetail}`;
      }

      return {
        type: this.buildTypeUri('unknown_error'),
        title: 'Unknown Error',
        status: 500,
        detail,
        instance,
        originalError: error,
      };
    }

    // Fallback for primitive types
    let detail = String(error);
    if (additionalDetail) {
      detail = `${detail}. ${additionalDetail}`;
    }

    return {
      type: this.buildTypeUri('unknown_error'),
      title: 'Unknown Error',
      status: 500,
      detail,
      instance,
    };
  }

  /**
   * Transform swagger-typescript-api errors to Problems
   * Specifically handles HttpResponse errors from swagger-generated clients
   */
  async fromSwaggerError(error: unknown, instance = 'unknown'): Promise<Problem> {
    // If it's already a Problem, return as-is
    if (isProblem(error)) return error;

    // Handle HttpResponse errors from swagger-typescript-api
    if (error && typeof error === 'object' && 'error' in error && 'data' in error) {
      const httpResponse = error as { error: unknown; data: unknown; status?: number; statusText?: string };

      // Check if the error content is a Problem
      if (isProblem(httpResponse.error)) return httpResponse.error;

      // Get status info
      const status = httpResponse.status || 500;

      // Try to get raw response body and other details
      let responseBody: string;
      let url: string | undefined;

      try {
        if (httpResponse && typeof httpResponse === 'object' && 'text' in httpResponse && 'clone' in httpResponse) {
          const httpResponseWithText = httpResponse as unknown as {
            clone(): { text(): Promise<string> };
            url?: string;
          };
          const responseClone = httpResponseWithText.clone();
          responseBody = await responseClone.text();
          url = httpResponseWithText.url;
        } else {
          responseBody = '';
        }
      } catch (e) {
        responseBody = '';
      }

      // Report to error reporter
      const httpError = new Error(`Swagger HTTP ${status}: ${responseBody}`);
      this.reportError(httpError, {
        url,
        status,
        instance,
        transformer: 'ProblemTransformer.fromSwaggerError',
      });

      // Create problem using registry
      const httpErrorContext: HttpErrorContext = {
        statusCode: status,
        responseBody: responseBody.trim() || undefined,
        url,
      };

      return this.problemRegistry.createProblem('http_error', httpErrorContext, undefined, instance);
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      // Report to error reporter
      this.reportError(error, {
        instance,
        context: 'Swagger API call',
        transformer: 'ProblemTransformer.fromSwaggerError',
      });

      // Create problem using registry
      const localErrorContext: LocalErrorContext = {
        errorName: error.constructor.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        context: 'Swagger API call',
      };

      return this.problemRegistry.createProblem('local_error', localErrorContext, undefined, instance);
    }

    // Handle unknown error types using existing fromUnknown method
    return this.fromUnknown(error, 'Swagger error', instance);
  }

  /**
   * Build a type URI for problems
   */
  private buildTypeUri(problemId: string): string {
    return `${this.config.baseUri}/${this.config.service}/api/v${this.config.version}/${problemId}`;
  }
}
