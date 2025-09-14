import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Problem } from '@/lib/problem/core/types';
import type { NextComponentType, NextPageContext } from 'next';
import { useErrorContext } from '@/lib/content/providers/ErrorContext';
import { detectSerialError } from '@/lib/problem/detect-serial-error';
import type { ProblemReporter } from '@/lib/problem/core';
import type { ErrorComponentProps } from '@/lib/problem/core/error-page';
import { useLoadingContext } from '@/lib/content/providers';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { useEmptyContext } from '@/lib/content/providers/EmptyContext';

export interface ContentManagerProps {
  // biome-ignore lint/suspicious/noExplicitAny: components can have any props
  Component: NextComponentType<NextPageContext, any, any>;
  problemReporter: ProblemReporter;
  // biome-ignore lint/suspicious/noExplicitAny: pageProps can be any
  pageProps: any;
  LoadingComponent: React.ComponentType;
  EmptyComponent: React.ComponentType<{ desc?: string }>;
  LayoutComponent: React.ComponentType<{ children: React.ReactNode }>;
  ErrorComponent: React.ComponentType<ErrorComponentProps>;
}

type ContentState = 'loading' | 'content' | 'error' | 'empty';

export function ContentManager({
  Component,
  pageProps,
  problemReporter,
  LoadingComponent,
  EmptyComponent,
  ErrorComponent,
  LayoutComponent,
}: ContentManagerProps) {
  const router = useRouter();
  const { currentError: contextError, clearError: clearContextError } = useErrorContext();
  const { throwProblem } = useErrorHandler();
  const { loading, startLoading, stopLoading } = useLoadingContext();
  const { desc, clearDesc } = useEmptyContext();
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
    if (error) return setState('error');
    if (loading) return setState('loading');
    if (desc) return setState('empty');
    setState('content');
  }, [error, loading, desc]);

  // Handle router loading states
  useEffect(() => {
    const handleRouteChangeStart = (_: string, { shallow }: { shallow: boolean }) => {
      clearDesc();
      clearContextError();
      if (!shallow) startLoading();
    };

    const handleRouteChangeComplete = (_: string, { shallow }: { shallow: boolean }) => {
      if (!shallow) stopLoading();
    };

    const handleRouteChangeError = (err: Error) => {
      const problem: Problem = {
        type: 'navigation_error',
        title: 'Navigation Error',
        status: 500,
        detail: err.message || 'An error occurred during navigation',
      };
      console.error('navigation', err);
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
  }, []);

  return (
    <LayoutComponent>
      <div className={state === 'content' ? '' : 'hidden'}>
        <Component {...pageProps} />
      </div>
      {state === 'empty' ? <EmptyComponent desc={desc} /> : <></>}
      {state === 'loading' ? <LoadingComponent /> : <></>}
      {state === 'error' ? (
        <ErrorComponent
          error={error ?? { type: 'unknown', title: 'Unknown Error', status: 500, detail: 'An unknown error occurred' }}
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
