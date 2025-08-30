import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Problem } from '@/lib/problem/core/types';
import type { NextComponentType, NextPageContext } from 'next';
import { useErrorContext } from '@/contexts/ErrorContext';
import { detectSerialError } from '@/lib/problem/detect-serial-error';
import { ProblemReporter } from '@/lib/problem/core';
import { ErrorComponentProps } from '@/lib/problem/core/error-page';

interface ContentManagerProps {
  Component: NextComponentType<NextPageContext, any, any>;
  problemReporter: ProblemReporter;
  pageProps: any;
  LoadingComponent: React.ComponentType;
  ErrorComponent: React.ComponentType<ErrorComponentProps>;
}

type ContentState = 'loading' | 'content' | 'error';

export function ContentManager({
  Component,
  pageProps,
  problemReporter,
  LoadingComponent,
  ErrorComponent,
}: ContentManagerProps) {
  const router = useRouter();
  const { currentError: contextError, clearError: clearContextError } = useErrorContext();
  const [state, setState] = useState<ContentState>('content');
  const [error, setError] = useState<Problem | null>(null);

  useEffect(() => {
    // Handle context errors (from useErrorHandler) - highest priority
    if (contextError) {
      console.log('🟠 ContentManager: Context error detected:', contextError);
      setError(contextError);
      setState('error');
    } else {
      // Handle page-level errors from props
      const detectedError = detectSerialError(pageProps);
      if (detectedError) {
        setError(detectedError);
        setState('error');
      } else if (state === 'error' && !error) {
        setState('content');
      }
    }
  }, [contextError, pageProps, state, error]);

  // Handle router loading states
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setState('loading');
    };

    const handleRouteChangeComplete = () => {
      if (state === 'loading') {
        setState('content');
        setError(null);
      }
    };

    const handleRouteChangeError = (err: Error) => {
      const problem: Problem = {
        type: 'navigation_error',
        title: 'Navigation Error',
        status: 500,
        detail: err.message || 'An error occurred during navigation',
      };
      problemReporter.pushError(err, { source: 'navigation-error', problem });
      setError(problem);
      setState('error');
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router, state]);

  // Render based on current state
  switch (state) {
    case 'loading':
      return <LoadingComponent />;

    case 'error':
      return error ? (
        <ErrorComponent
          error={error}
          onRefresh={() => {
            setError(null);
            setState('content');
            clearContextError();
          }}
        />
      ) : (
        <Component {...pageProps} />
      );

    case 'content':
    default:
      return <Component {...pageProps} />;
  }
}
