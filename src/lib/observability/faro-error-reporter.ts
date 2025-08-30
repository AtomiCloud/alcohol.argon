import { faro } from '@grafana/faro-web-sdk';
import type { ProblemReporter } from '@/lib/problem/core/transformer';

/**
 * Faro implementation of ErrorReporter interface
 */
export class FaroErrorReporter implements ProblemReporter {
  pushError(error: Error, context?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && faro.api) {
      faro.api.pushError(error, context);
    }
  }

  getSessionId(): string {
    if (typeof window !== 'undefined' && faro.api) {
      try {
        // Try to get session ID from Faro's internal state
        const session = faro.api.getSession?.();
        if (session?.id) {
          return session.id;
        }
      } catch (e) {
        // If we can't get session ID, fall back to unknown
      }
    }
    return 'unknown';
  }

  getTraceId(): string {
    if (typeof window !== 'undefined' && faro.api) {
      try {
        // Try to get current trace ID from OpenTelemetry context
        const otel = faro.api.getOTEL?.();
        if (otel?.trace) {
          const activeSpan = otel.trace.getActiveSpan?.();
          if (activeSpan) {
            const spanContext = activeSpan.spanContext?.();
            if (spanContext?.traceId) {
              return spanContext.traceId;
            }
          }
        }
      } catch (e) {
        // If we can't get trace ID, fall back to unknown
      }
    }
    return 'unknown';
  }
}
