import React, { useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem } from '@/lib/problem/core/types';
import type { ResultSerial } from '@/lib/monads/result';
import { ProblemErrorAnimation } from '@/components/lottie/ErrorAnimations';
import { LoadingLottie } from '@/components/lottie/presets';
import { ErrorPage } from '@/components/error-page/ErrorPage';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { useProblemRegistry } from '@/adapters/external/Provider';
import { detectSerialError } from '@/lib/problem/detect-serial-error';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

interface FrameworkDemoProps {
  // Example of how pages can receive serialized error results
  result?: ResultSerial<string, Problem>;
  error?: Problem;
}

/**
 * Demo page to test the navigation loading and error handling framework
 * This page demonstrates:
 * 1. Navigation loading states
 * 2. Error boundary catching
 * 3. Serial Result error detection
 * 4. Various error types and animations
 */
export default function FrameworkDemo({ result, error }: FrameworkDemoProps) {
  const problemRegistry = useProblemRegistry();

  const router = useRouter();
  const { throwError: handleThrowContextError } = useErrorHandler();
  const [throwError, setThrowError] = useState(false);
  const [manualProblem, setManualProblem] = useState<Problem | null>(null);
  const [showLoadingTest, setShowLoadingTest] = useState(false);

  // Check for loading test query parameter
  React.useEffect(() => {
    if (router.query.test === 'loading') {
      setShowLoadingTest(true);
      setTimeout(() => {
        setShowLoadingTest(false);
        router.replace('/framework-demo', undefined, { shallow: true });
      }, 5000);
    }
  }, [router.query.test, router]);

  // This will be caught by the error boundary during render
  if (throwError) {
    throw new Error('This is a test error thrown from a React component');
  }

  // Simulate different error scenarios
  const handleThrowError = () => {
    console.warn('🚨 Throwing sync error via context...');

    // Use context error (works reliably in both dev and prod)
    handleThrowContextError('This is a test error thrown from a React component');
  };

  const handleAsyncError = () => {
    console.warn('🚨 Throwing async error...');

    // Use context error for async (React error boundary can't catch async)
    setTimeout(() => {
      handleThrowContextError('This is an async error');
    }, 100);
  };

  const handleThrowBoundaryError = () => {
    console.warn('🚨 Throwing React boundary error...');

    // Only use React error boundary (for testing if it works in production)
    setThrowError(true);
  };

  const handleNavigationTest = () => {
    // Navigate immediately to show loading state
    router.push('/');
  };

  // Manual problem state handlers
  const handleShowValidationProblem = () => {
    const problem = problemRegistry.createProblem('validation_error', {
      field: 'username',
      constraint: 'Username must be between 3-20 characters',
      value: 'ab',
    });
    setManualProblem(problem);
  };

  const handleShowUnauthorizedProblem = () => {
    const problem = problemRegistry.createProblem('unauthorized', {
      requiredPermission: 'admin:write',
      userId: 'demo-user-123',
    });
    setManualProblem(problem);
  };

  const handleShowConflictProblem = () => {
    const problem = problemRegistry.createProblem('entity_conflict', {
      TypeName: 'User',
      AssemblyQualifiedName: 'Models.User',
    });
    setManualProblem(problem);
  };

  const handleClearProblem = () => {
    setManualProblem(null);
  };

  const handleShowLoadingTest = () => {
    setShowLoadingTest(true);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowLoadingTest(false);
    }, 30000);
  };

  // If manual problem is set, show ErrorPage
  if (manualProblem) {
    return <ErrorPage error={manualProblem} onRefresh={handleClearProblem} />;
  }

  // If loading test is active, show loading state
  if (showLoadingTest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-800">
        <div className="text-center space-y-8 p-8">
          <h2 className="text-2xl font-bold mb-8">Loading Animation Size Test</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="text-center space-y-4 p-4 bg-white dark:bg-slate-700 rounded-lg shadow">
              <h3 className="text-lg font-medium">Fixed Size: 120px</h3>
              <LoadingLottie size={120} />
              <p className="text-sm text-slate-500">Fixed pixel size</p>
            </div>

            <div className="text-center space-y-4 p-4 bg-white dark:bg-slate-700 rounded-lg shadow border-2 border-green-500">
              <h3 className="text-lg font-medium">Responsive: 90vw max 400px</h3>
              <LoadingLottie />
              <p className="text-sm text-slate-500">New responsive size (current)</p>
            </div>
          </div>

          <div className="text-center space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="text-lg font-medium">Full Screen Preview</h3>
            <p className="text-sm text-slate-500 mb-4">This shows how it looks in actual loading state:</p>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
              <LoadingLottie />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              This will auto-close in 30 seconds - Compare the sizes above
            </p>
            <div className="mt-2">
              <div className="w-80 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto">
                <div className="h-2 bg-blue-500 rounded-full animate-pulse" style={{ width: '33%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Framework Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            This page demonstrates the navigation loading and error handling framework.
          </p>

          {/* Show if we received an error via SSR */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                SSR Error Detected: {error.title} - {error.detail}
              </p>
            </div>
          )}

          {/* Show if we received a result via SSR */}
          {result && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">SSR Result: {JSON.stringify(result)}</p>
            </div>
          )}

          {/* Debug section for pageProps */}
          <details className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
            <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300 mb-2">
              Debug: PageProps & Error Detection
            </summary>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Current PageProps:</strong>
                <pre className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto">
                  {JSON.stringify({ result, error }, null, 2)}
                </pre>
              </div>
              <div>
                <strong>detectSerialError() would find:</strong>
                <pre className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                  {JSON.stringify(detectSerialError({ result, error }) || 'null', null, 2)}
                </pre>
              </div>
            </div>
          </details>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Error Testing */}
            <Card>
              <CardHeader>
                <CardTitle>Context Error Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleThrowError} variant="destructive" className="w-full">
                  Throw Context Error
                </Button>

                <Button onClick={handleThrowBoundaryError} variant="destructive" className="w-full">
                  Throw Boundary Error
                </Button>

                <Button onClick={handleAsyncError} variant="destructive" className="w-full">
                  Throw Async Error
                </Button>
              </CardContent>
            </Card>

            {/* PageProps Error Testing */}
            <Card>
              <CardHeader>
                <CardTitle>PageProps Error Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/framework-demo?error_type=validation')}
                  variant="destructive"
                  className="w-full"
                >
                  SSR Validation Error
                </Button>

                <Button
                  onClick={() => router.push('/framework-demo?error_type=unauthorized')}
                  variant="destructive"
                  className="w-full"
                >
                  SSR Unauthorized Error
                </Button>

                <Button
                  onClick={() => router.push('/framework-demo?error_type=server_error')}
                  variant="destructive"
                  className="w-full"
                >
                  SSR Server Error
                </Button>

                <Button onClick={() => router.push('/framework-demo')} variant="outline" className="w-full">
                  Clear Errors
                </Button>
              </CardContent>
            </Card>

            {/* Navigation Testing */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleNavigationTest} variant="outline" className="w-full">
                  Test Loading State (Navigation)
                </Button>

                <Button onClick={handleShowLoadingTest} variant="outline" className="w-full">
                  Test Loading Size (Manual)
                </Button>

                <Button onClick={() => router.push('/nonexistent')} variant="outline" className="w-full">
                  Navigate to 404
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Manual Problem State Demonstration */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Problem State Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Test different Problem types with their corresponding animations:
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <Button onClick={handleShowValidationProblem} variant="outline" className="w-full">
                  Validation Error (400)
                </Button>

                <Button onClick={handleShowUnauthorizedProblem} variant="outline" className="w-full">
                  Unauthorized (401)
                </Button>

                <Button onClick={handleShowConflictProblem} variant="outline" className="w-full">
                  Conflict (409)
                </Button>
              </div>

              {/* Animation Preview Section */}
              <div className="border-t pt-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Animation Previews:</p>
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <ProblemErrorAnimation
                      problem={{
                        type: 'validation_error',
                        title: 'ValidationError',
                        status: 400,
                        detail: 'Preview',
                        field: 'demo',
                        constraint: 'preview',
                      }}
                      size={60}
                    />
                    <p className="text-xs text-slate-500 mt-1">400 Error</p>
                  </div>
                  <div className="text-center">
                    <ProblemErrorAnimation
                      problem={{
                        type: 'unauthorized',
                        title: 'Unauthorized',
                        status: 401,
                        detail: 'Preview',
                        requiredPermission: 'demo',
                      }}
                      size={60}
                    />
                    <p className="text-xs text-slate-500 mt-1">401 Error</p>
                  </div>
                  <div className="text-center">
                    <ProblemErrorAnimation
                      problem={{
                        type: 'entity_conflict',
                        title: 'EntityConflict',
                        status: 409,
                        detail: 'Preview',
                        TypeName: 'Demo',
                      }}
                      size={60}
                    />
                    <p className="text-xs text-slate-500 mt-1">409 Error</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={() => router.push('/')} variant="secondary">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example of how to return different types of errors from getServerSideProps
 */
export const getServerSideProps = withServerSideAtomi(
  buildTime,
  async (context, { problemRegistry }): Promise<GetServerSidePropsResult<FrameworkDemoProps>> => {
    const { error_type } = context.query;

    // Simulate different error scenarios based on query parameter
    switch (error_type) {
      case 'validation':
        // Return a serialized error result
        const validationProblem = problemRegistry.createProblem('validation_error', {
          field: 'email',
          constraint: 'Email is required for demo purposes',
          value: '',
        });
        // Remove undefined properties for Next.js serialization
        const { instance, ...serializableProblem } = validationProblem;
        const problemForSerialization =
          instance !== undefined ? { ...serializableProblem, instance } : serializableProblem;
        return {
          props: {
            result: ['err', problemForSerialization] as ResultSerial<string, Problem>,
          },
        };

      case 'unauthorized':
        // Return error directly in props
        const unauthorizedProblem = problemRegistry.createProblem('unauthorized', {
          requiredPermission: 'framework-demo:view',
          userId: 'demo-user',
        });
        // Remove undefined properties for Next.js serialization
        const { instance: instance2, ...serializableProblem2 } = unauthorizedProblem;
        const problemForSerialization2 =
          instance2 !== undefined ? { ...serializableProblem2, instance: instance2 } : serializableProblem2;
        return {
          props: {
            error: problemForSerialization2,
          },
        };

      case 'server_error':
        // Throw an error to test server-side error handling
        throw new Error('This is a server-side error for testing');

      default:
        // Normal successful response
        return {
          props: {
            result: ['ok', 'Framework demo loaded successfully'] as ResultSerial<string, Problem>,
          },
        };
    }
  },
);
