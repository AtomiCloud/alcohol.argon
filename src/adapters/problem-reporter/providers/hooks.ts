import type { ErrorReporter } from '@/lib/problem/core';
import { useErrorReporterContext } from '@/adapters/problem-reporter/providers/ErrorReporterProvider';

function useErrorReporter(): ErrorReporter {
  const { reporter } = useErrorReporterContext();
  return reporter;
}

export { useErrorReporter };
