import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Problem } from '@/lib/problem/core/types';
import type { NextComponentType, NextPageContext } from 'next';
import { useErrorContext } from '@/lib/content/providers/ErrorContext';
import { detectSerialError } from '@/lib/problem/detect-serial-error';
import { ProblemReporter } from '@/lib/problem/core';
import { ErrorComponentProps } from '@/lib/problem/core/error-page';
import { useLoadingContext } from '../providers/LoadingContext';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';

interface ContentManagerProps {
  Component: NextComponentType<NextPageContext, any, any>;
  problemReporter: ProblemReporter;
  pageProps: any;
  LoadingComponent: React.ComponentType;
  LayoutComponent: React.ComponentType<{ children: React.ReactNode }>;
  ErrorComponent: React.ComponentType<ErrorComponentProps>;
}

type ContentState = 'loading' | 'content' | 'error';

export function ContentManager({
  Component,
  pageProps,
  problemReporter,
  LoadingComponent,
  ErrorComponent,
  LayoutComponent,
}: ContentManagerProps) {
  const router = useRouter();
  const { currentError: contextError, clearError: clearContextError } = useErrorContext();
  const { throwProblem } = useErrorHandler();
  const { loading, startLoading, stopLoading } = useLoadingContext();
  const [state, setState] = useState<ContentState>('content');
  const [error, setError] = useState<Problem | null>(null);

  // Handle Errors
  useEffect(() => {
    // if the error has been explicitly throwErrorContext
    if (contextError) return setError(contextError);
    // if SSR returns error
    const detectedError = detectSerialError(pageProps);
    if (detectedError) return setError(detectedError);
    // clear error if nothing returns error
    setError(null);
  }, [contextError, pageProps]);

  useEffect(() => {
    console.log('something changed', error, loading);
    if (error) return setState('error');
    if (loading) return setState('loading');
    setState('content');
  }, [error, loading]);

  // Handle router loading states
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setTimeout(startLoading, 0);
    };

    const handleRouteChangeComplete = () => {
      stopLoading();
      clearContextError();
    };

    const handleRouteChangeError = (err: Error) => {
      const problem: Problem = {
        type: 'navigation_error',
        title: 'Navigation Error',
        status: 500,
        detail: err.message || 'An error occurred during navigation',
      };
      problemReporter.pushError(err, { source: 'navigation-error', problem });
      throwProblem(problem);
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

  return (
    <LayoutComponent>
      <div className={state === 'content' ? '' : 'hidden'}>
        <Component {...pageProps} />
      </div>
      {state === 'loading' ? <LoadingComponent /> : <></>}
      {state === 'error' && error ? (
        <ErrorComponent
          error={error}
          onRefresh={() => {
            setError(null);
            setState('content');
            clearContextError();
          }}
        />
      ) : (
        <></>
      )}
    </LayoutComponent>
  );
}
