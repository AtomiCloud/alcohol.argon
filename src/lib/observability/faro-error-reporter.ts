import { faro } from '@grafana/faro-web-sdk';
import type { ErrorReporter } from '@/lib/problem/core/transformer';

/**
 * Faro implementation of ErrorReporter interface
 */
export class FaroErrorReporter implements ErrorReporter {
  pushError(error: Error, context?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && faro.api) {
      faro.api.pushError(error, context);
    }
  }
}
