import type React from 'react';
import { Component, type ReactNode } from 'react';
import type { ProblemTransformer } from '@/lib/problem/core/transformer';
import type { Problem } from '@/lib/problem/core/types';
import type { ProblemDefinitions } from '@/lib/problem/core';
import type { ErrorComponentProps } from '@/lib/problem/core/error-page';

interface GlobalErrorBoundaryProps<T extends ProblemDefinitions> {
  children: ReactNode;
  problemTransformer: ProblemTransformer<T>;
  ErrorComponent: React.ComponentType<ErrorComponentProps>;
  onError?: (error: Problem, errorInfo: React.ErrorInfo) => void;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Problem | null;
}

export class GlobalErrorBoundaryInner<T extends ProblemDefinitions> extends Component<
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
    console.warn('🔴 GlobalErrorBoundaryInner caught error:', error);
    console.warn('🔴 Error info:', errorInfo);

    const problem = this.problemTransformer.fromError(
      error,
      `React Error Boundary: ${errorInfo.componentStack}`,
      window.location.pathname,
    );

    console.warn('🔴 Converted to Problem:', problem);

    this.setState({
      hasError: true,
      error: problem,
    });

    this.props.onError?.(problem, errorInfo);
  }

  render() {
    const { ErrorComponent } = this.props;

    if (this.state.hasError && this.state.error) {
      return (
        <ErrorComponent
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
