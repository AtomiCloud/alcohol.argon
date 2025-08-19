import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  type ErrorReporter,
  type ProblemConfig,
  type ProblemDefinitions,
  ProblemRegistry,
  ProblemTransformer,
} from '../core';

export type ServerSideProblemHandler<T extends ProblemDefinitions, P = Record<string, unknown>> = (
  context: GetServerSidePropsContext,
  problemRegistry: ProblemRegistry<T>,
  problemTransformer: ProblemTransformer<T>,
) => Promise<GetServerSidePropsResult<P>>;

export function withServerSideProblem<T extends ProblemDefinitions, P = Record<string, unknown>>(
  config: ProblemConfig,
  problemDefinition: T,
  errorReporter: ErrorReporter,
  handler: ServerSideProblemHandler<T, P>,
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>> {
  return async (context: GetServerSidePropsContext) => {
    try {
      const problemRegistry = new ProblemRegistry(config, problemDefinition);
      const problemTransformer = new ProblemTransformer(problemRegistry, errorReporter);

      // Call the user's handler with the config registry
      return await handler(context, problemRegistry, problemTransformer);
    } catch (error) {
      console.error('Problem error in API route:', error);

      const errorMessage = error instanceof Error ? error.message : 'Problem initialization failed';
      return {
        props: {
          _problemError: errorMessage,
        } as P,
      };
    }
  };
}
