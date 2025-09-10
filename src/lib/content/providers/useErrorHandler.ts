import { useCallback } from 'react';
import { useErrorContext } from '@/lib/content/providers/ErrorContext';
import type { Problem } from '@/lib/problem/core/types';
import { useProblemTransformer } from '@/adapters/external/Provider';

function useErrorHandler() {
  const { setError } = useErrorContext();

  const problemTransformer = useProblemTransformer();

  const throwUnknown = useCallback(
    (error: unknown) => {
      const problem = problemTransformer.fromUnknown(
        error,
        'Manual error thrown via useErrorHandler (throwUnknown)',
        window.location.pathname,
      );
      setError(problem);
    },
    [setError, problemTransformer],
  );

  const throwError = useCallback(
    (error: Error | string) => {
      const errorObj = typeof error === 'string' ? new Error(error) : error;

      // Convert error to Problem using the transformer
      const problem = problemTransformer.fromError(
        errorObj,
        'Manual error thrown via useErrorHandler (throwError)',
        window.location.pathname,
      );

      // Set error in context (bypasses React error boundary)
      setError(problem);
    },
    [setError, problemTransformer],
  );

  const throwProblem = useCallback(
    (problem: Problem) => {
      setError(problem);
    },
    [setError],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    throwError,
    throwProblem,
    throwUnknown,
    clearError,
  };
}

export { useErrorHandler };
