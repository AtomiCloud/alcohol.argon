import { type ProblemReporter, NoOpErrorReporter } from '@/lib/problem/core';
import type { ProblemReporterFactory } from '@/lib/problem/core/transformer';
import { FaroErrorReporter } from '@/lib/observability';

class FaroErrorReporterFactory implements ProblemReporterFactory {
  constructor(private readonly faro: boolean) {}

  get(): ProblemReporter {
    return this.faro ? new FaroErrorReporter() : new NoOpErrorReporter();
  }
}

export { FaroErrorReporterFactory };
