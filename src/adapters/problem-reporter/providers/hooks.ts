import type { ProblemReporter } from '@/lib/problem/core';
import { useProblemReporterContext } from '@/adapters/problem-reporter/providers/adapter';
import type { ProblemReporterFactory } from '@/lib/problem/core/transformer';

function useProblemReporter(): ProblemReporter {
  const {
    resource: { reporter },
  } = useProblemReporterContext();
  return reporter;
}

function useProblemReporterFactory(): ProblemReporterFactory {
  const {
    resource: { factory },
  } = useProblemReporterContext();
  return factory;
}

export { useProblemReporter, useProblemReporterFactory };
