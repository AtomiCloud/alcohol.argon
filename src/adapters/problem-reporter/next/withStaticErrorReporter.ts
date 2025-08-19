import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import type { ErrorReporter } from '@/lib/problem/core';
import type { ErrorReporterFactory } from '@/lib/problem/core/transformer';

export type StaticSwaggerErrorReporter<P = Record<string, unknown>> = (
  context: GetStaticPropsContext,
  api: ErrorReporter,
) => Promise<GetStaticPropsResult<P>>;

export function withStaticErrorReporter<P = Record<string, unknown>>(
  factory: ErrorReporterFactory,
  handler: StaticSwaggerErrorReporter<P>,
): (context: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>> {
  return async (context: GetStaticPropsContext) => {
    try {
      const reporter = factory.get();
      return await handler(context, reporter);
    } catch (error) {
      console.error('Error Reporter init error in API route:', error);

      const errorMessage = error instanceof Error ? error.message : 'Error Reporter initialization failed';

      return {
        props: {
          _problemError: errorMessage,
        } as P,
      };
    }
  };
}
