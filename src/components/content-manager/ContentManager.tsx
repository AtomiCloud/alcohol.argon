import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LoadingLottie } from '@/components/lottie/presets';
import { ErrorPage } from '@/components/error-page/ErrorPage';
import type { Problem } from '@/lib/problem/core/types';
import type { NextComponentType, NextPageContext } from 'next';
import { useErrorContext } from '@/contexts/ErrorContext';
import { useProblemReporter } from '@/adapters/problem-reporter/providers';
import { detectSerialError } from '@/lib/problem/detect-serial-error';

interface ContentManagerProps {
  Component: NextComponentType<NextPageContext, any, any>;
  pageProps: any;
}

type ContentState = 'loading' | 'content' | 'error';

export function ContentManager({ Component, pageProps }: ContentManagerProps) {
  const router = useRouter();
  const { currentError: contextError, clearError: clearContextError } = useErrorContext();
  const problemReporter = useProblemReporter();
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
      return (
        <div className="min-h-screen pt-20">
          <div className="flex flex-col items-center text-center space-y-6 p-8">
            <LoadingLottie />
            <div className="space-y-2">
              <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">Loading...</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we load the content!</p>
            </div>
          </div>
        </div>
      );

    case 'error':
      return error ? (
        <ErrorPage
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
