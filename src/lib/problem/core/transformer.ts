import type { Problem, ProblemConfig, HttpErrorDetails } from './types';
import { isProblem } from './types';

/**
 * Core transformer class for converting errors to RFC 7807 Problems
 * Designed to be DI-compatible - only handles library catch-all problems
 */
export class ProblemTransformer {
  constructor(private config: ProblemConfig) {}

  /**
   * Transform a native Error to a Problem (library catch-all)
   */
  fromError(error: Error, additionalDetail?: string, instance?: string): Problem {
    let detail = error.message;
    if (additionalDetail) {
      detail = `${detail}. ${additionalDetail}`;
    }

    return {
      type: this.buildTypeUri('internal_error'),
      title: 'Internal Error',
      status: 500,
      detail,
      instance,
      stack: error.stack,
      name: error.name,
    };
  }

  /**
   * Transform HTTP error details to a Problem (library catch-all)
   */
  fromHttpError(details: HttpErrorDetails, additionalDetail?: string, instance?: string): Problem {
    // Try to parse body as JSON to check if it's already a problem
    let bodyData: unknown = null;
    if (details.body) {
      try {
        bodyData = JSON.parse(details.body);
      } catch {
        // Body is not JSON, treat as plain text
        bodyData = details.body;
      }
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

    // Create a generic HTTP problem (library catch-all)
    let detail = this.buildHttpErrorDetail(details);
    if (additionalDetail) {
      detail = `${detail}. ${additionalDetail}`;
    }

    return {
      type: this.buildTypeUri('http_error'),
      title: 'HTTP Error',
      status: details.status,
      detail,
      instance,
      statusText: details.statusText,
      headers: details.headers,
      url: details.url,
      responseBody: details.body,
    };
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

    // If it's an Error object
    if (error instanceof Error) {
      return this.fromError(error, additionalDetail, instance);
    }

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
   * Transform swagger-typescript-api error to Problem (library catch-all)
   */
  fromSwaggerError(error: unknown, url?: string, additionalDetail?: string, instance?: string): Problem {
    // Check if it's already a structured error from swagger-typescript-api
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;

      // Handle axios-style error
      if (errorObj.response) {
        const response = errorObj.response as Record<string, unknown>;
        const httpError = {
          status: Number(response.status) || 500,
          statusText: String(response.statusText) || 'Unknown',
          body: response.data ? JSON.stringify(response.data) : undefined,
          headers: response.headers as Record<string, string>,
          url: url || (errorObj.config as Record<string, unknown>)?.url?.toString(),
        };

        return this.fromHttpError(httpError, additionalDetail, instance);
      }

      // Handle fetch-style error
      if (errorObj.status && errorObj.statusText) {
        const httpError = {
          status: Number(errorObj.status),
          statusText: String(errorObj.statusText),
          body: errorObj.body?.toString(),
          url,
        };

        return this.fromHttpError(httpError, additionalDetail, instance);
      }
    }

    // Fallback to unknown error handling
    return this.fromUnknown(error, additionalDetail, instance);
  }

  /**
   * Build a type URI for problems
   */
  private buildTypeUri(problemId: string): string {
    return `${this.config.baseUri}/${this.config.service}/api/v${this.config.version}/${problemId}`;
  }

  /**
   * Build a detailed error message for HTTP errors
   */
  private buildHttpErrorDetail(details: HttpErrorDetails): string {
    let detail = `HTTP ${details.status} ${details.statusText}`;

    if (details.url) {
      detail += ` at ${details.url}`;
    }

    if (details.body) {
      detail += `. Response: ${details.body}`;
    }

    return detail;
  }
}
