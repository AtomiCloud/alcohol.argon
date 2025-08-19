import type { ErrorReporter } from './transformer';

/**
 * No-op implementation of ErrorReporter interface
 * Use this when you don't want any error reporting functionality
 */
export class NoOpErrorReporter implements ErrorReporter {
  pushError(_error: Error, _context?: Record<string, unknown>): void {}

  getSessionId(): string {
    return 'unknown';
  }

  getTraceId(): string {
    return 'unknown';
  }
}
