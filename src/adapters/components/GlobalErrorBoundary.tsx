import type React from 'react';
import type { ReactNode } from 'react';
import type { Problem } from '@/lib/problem/core';
import { useProblemTransformer } from '@/adapters/external/Provider';
import { GlobalErrorBoundaryInner } from '@/lib/content/components';
import type { ErrorComponentProps } from '@/lib/problem/core/error-page';

type GlobalErrorBoundaryProps = {
  children: ReactNode;
  ErrorComponent: React.ComponentType<ErrorComponentProps>;
  onError?: (error: Problem, errorInfo: React.ErrorInfo) => void;
};

export function GlobalErrorBoundary({ children, ErrorComponent, onError }: GlobalErrorBoundaryProps) {
  const problemTransformer = useProblemTransformer();
  return (
    <GlobalErrorBoundaryInner problemTransformer={problemTransformer} ErrorComponent={ErrorComponent} onError={onError}>
      {children}
    </GlobalErrorBoundaryInner>
  );
}
