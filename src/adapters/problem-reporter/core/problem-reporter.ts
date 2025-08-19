import { type ErrorReporter, NoOpErrorReporter } from '@/lib/problem/core';
import type { ErrorReporterFactory } from '@/lib/problem/core/transformer';
import { FaroErrorReporter } from '@/lib/observability';

class FaroErrorReporterFactory implements ErrorReporterFactory {
  constructor(private readonly faro: boolean) {}

  get(): ErrorReporter {
    return this.faro ? new FaroErrorReporter() : new NoOpErrorReporter();
  }
}

export { FaroErrorReporterFactory };
