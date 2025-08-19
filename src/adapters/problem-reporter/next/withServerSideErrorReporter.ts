import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ErrorReporter } from '@/lib/problem/core';
import type { ErrorReporterFactory } from '@/lib/problem/core/transformer';
import { FaroErrorReporterFactory } from '@/adapters/problem-reporter/core/problem-reporter';

export type ServerSideErrorReporterHandler<P = Record<string, unknown>> = (
  context: GetServerSidePropsContext,
  errorReporter: ErrorReporter,
) => Promise<GetServerSidePropsResult<P>>;

export function withServerSideErrorReporter<P = Record<string, unknown>>(
  faro: boolean,
  handler: ServerSideErrorReporterHandler<P>,
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>> {
  return async (context: GetServerSidePropsContext) => {
    try {
      const factory = new FaroErrorReporterFactory(faro);
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
