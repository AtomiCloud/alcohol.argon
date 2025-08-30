import type { Problem } from './types';
import { isProblem } from './types';
import type { ProblemRegistry } from './registry';
import type { ProblemDefinitions } from '.';
import type { LocalErrorContext } from './definition/local-error';
import type { UnknownErrorContext } from './definition/unknown-error';
import type { HttpErrorContext } from './definition/http-error';

/**
 * Interface for error reporting functionality (e.g., Faro, Sentry, etc.)
 */
interface ProblemReporter {
  pushError(error: Error, context?: Record<string, unknown>): void;
  getSessionId(): string;
  getTraceId(): string;
}

interface ProblemReporterFactory {
  get(): ProblemReporter;
}

/**
 * Core transformer class for converting errors to RFC 7807 Problems
 * Designed to be DI-compatible - only handles library catch-all problems
 */
class ProblemTransformer<T extends ProblemDefinitions> {
  constructor(
    private problemRegistry: ProblemRegistry<T>,
    private errorReporter: ProblemReporter,
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
   * Enrich problem with session and trace IDs from error reporter
   * Only adds IDs if they're not already present in the problem
   */
  private enrichProblemWithIds(problem: Problem): Problem {
    try {
      const enrichedProblem = { ...problem };
      // Only set sessionId if not already present
      if (!enrichedProblem.sessionId) enrichedProblem.sessionId = this.errorReporter.getSessionId();
      // Only set traceId if not already present
      if (!enrichedProblem.traceId) enrichedProblem.traceId = this.errorReporter.getTraceId();
      return enrichedProblem;
    } catch (e) {
      // If we can't get IDs, return problem as-is
      console.debug('Failed to enrich problem with IDs:', e);
      return problem;
    }
  }

  /**
   * Transform a native Error to a Problem (library catch-all)
   */
  fromError(error: Error, additionalDetail = '', instance = 'unknown'): Problem {
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

    // biome-ignore lint/suspicious/noExplicitAny: Type system not powerful enough to ensure type-fitting
    const problem = this.problemRegistry.createProblem('local_error', localErrorContext as any, undefined, instance);
    return this.enrichProblemWithIds(problem);
  }

  /**
   * Transform unknown error to a Problem (library catch-all)
   */
  fromUnknown(error: unknown, additionalDetail = '', instance = 'unknown'): Problem {
    const ad = additionalDetail.length === 0 ? '' : `. ${additionalDetail}`;

    // If it's already a problem, return as-is (but add additional detail if provided)
    if (isProblem(error))
      return this.enrichProblemWithIds({
        ...error,
        detail: `${error.detail}${ad}`,
      });

    // If it's an Error object, use fromError (which handles Faro reporting)
    if (error instanceof Error) return this.fromError(error, additionalDetail, instance);

    // Report non-Error objects to error reporter as synthetic errors
    const syntheticError = new Error(typeof error === 'string' ? error : 'Unknown error occurred');
    this.reportError(syntheticError, {
      originalError: error,
      errorType: typeof error,
      additionalDetail,
      instance,
      transformer: 'ProblemTransformer.fromUnknown',
    });

    const parsed: string = (() => {
      // if it's a string, return the object itself
      if (typeof error === 'string') return `${error}.`;

      // if it's an object, return he JSON form or "an unknown error occurred"
      if (error && typeof error === 'object') {
        try {
          return JSON.stringify(error);
        } catch {
          return 'an unknown error occurred';
        }
      }
      // else, cast it to string and return it.
      return String(error);
    })();
    // add additionalDetail if exists.
    const detail = `${parsed}${ad}`;

    const unknownError: UnknownErrorContext = {
      type: typeof error,
      value: detail,
      stackTrace: new Error('Stack trace generator').stack,
    };

    // biome-ignore lint/suspicious/noExplicitAny: Type system not powerful enough to ensure type-fitting
    const problem = this.problemRegistry.createProblem('local_error', unknownError as any, undefined, instance);
    return this.enrichProblemWithIds(problem);
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
        responseBody: responseBody.trim() || 'unknown',
        url,
      };

      // biome-ignore lint/suspicious/noExplicitAny: Type system not powerful enough to ensure type-fitting
      return this.problemRegistry.createProblem('http_error', httpErrorContext as any, undefined, instance);
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

      // biome-ignore lint/suspicious/noExplicitAny: Type system not powerful enough to ensure type-fitting
      return this.problemRegistry.createProblem('local_error', localErrorContext as any, undefined, instance);
    }

    // Handle unknown error types using existing fromUnknown method
    return this.fromUnknown(error, 'Swagger error', instance);
  }
}

export type { ProblemReporter, ProblemReporterFactory };
export { ProblemTransformer };
