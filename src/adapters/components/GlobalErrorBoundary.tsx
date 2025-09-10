import React, { ReactNode } from 'react';
import type { Problem } from '@/lib/problem/core';
import { useProblemTransformer } from '@/adapters/external/Provider';
import { GlobalErrorBoundaryInner } from '@/lib/content/components';
import { ErrorComponentProps } from '@/lib/problem/core/error-page';

type GlobalErrorBoundaryProps = {
  children: ReactNode;
  ErrorComponent: React.ComponentType<ErrorComponentProps>;
  onError?: (error: Problem, errorInfo: React.ErrorInfo) => void;
};

export function GlobalErrorBoundary({ children, ErrorComponent, onError }: GlobalErrorBoundaryProps) {
  const problemTransformer = useProblemTransformer();
  return (
    <GlobalErrorBoundaryInner
      problemTransformer={problemTransformer}
      ErrorComponent={ErrorComponent}
      onError={onError}
      children={children}
    />
  );
}
