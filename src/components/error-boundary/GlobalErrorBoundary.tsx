import React, { Component, ReactNode } from 'react';
import { ProblemTransformer } from '@/lib/problem/core/transformer';
import type { Problem } from '@/lib/problem/core/types';
import { ErrorPage } from '@/components/error-page/ErrorPage';
import { ProblemDefinitions } from '@/lib/problem/core';
import { useProblemTransformer } from '@/adapters/external/Provider';

interface GlobalErrorBoundaryProps<T extends ProblemDefinitions> {
  children: ReactNode;
  problemTransformer: ProblemTransformer<T>;
  onError?: (error: Problem, errorInfo: React.ErrorInfo) => void;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Problem | null;
}

class GlobalErrorBoundaryInner<T extends ProblemDefinitions> extends Component<
  GlobalErrorBoundaryProps<T>,
  GlobalErrorBoundaryState
> {
  private problemTransformer: ProblemTransformer<T>;

  constructor(props: GlobalErrorBoundaryProps<T>) {
    super(props);
    this.problemTransformer = props.problemTransformer;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return {
      hasError: true,
      error: null, // Will be set in componentDidCatch
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('🔴 GlobalErrorBoundaryInner caught error:', error);
    console.log('🔴 Error info:', errorInfo);

    const problem = this.problemTransformer.fromError(
      error,
      `React Error Boundary: ${errorInfo.componentStack}`,
      window.location.pathname,
    );

    console.log('🔴 Converted to Problem:', problem);

    this.setState({
      hasError: true,
      error: problem,
    });

    this.props.onError?.(problem, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorPage
          error={this.state.error}
          onRefresh={() => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}

export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  const problemTransformer = useProblemTransformer();
  return <GlobalErrorBoundaryInner problemTransformer={problemTransformer} children={children} />;
}
