import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import {
  type ErrorReporter,
  type ProblemConfig,
  type ProblemDefinitions,
  ProblemRegistry,
  ProblemTransformer,
} from '../core';

export type StaticProblemHandler<T extends ProblemDefinitions, P = Record<string, unknown>> = (
  context: GetStaticPropsContext,
  problemRegistry: ProblemRegistry<T>,
  problemTransformer: ProblemTransformer<T>,
) => Promise<GetStaticPropsResult<P>>;

export function withStaticProblem<T extends ProblemDefinitions, P = Record<string, unknown>>(
  config: ProblemConfig,
  problemDefinition: T,
  errorReporter: ErrorReporter,
  handler: StaticProblemHandler<T, P>,
): (context: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>> {
  return async (context: GetStaticPropsContext) => {
    try {
      const problemRegistry = new ProblemRegistry(config, problemDefinition);
      const problemTransformer = new ProblemTransformer(problemRegistry, errorReporter);
      // Call the user's handler with the config registry
      return await handler(context, problemRegistry, problemTransformer);
    } catch (error) {
      console.error('Problem error in API route:', error);
      const errorMessage = error instanceof Error ? error.message : 'Problem initialization failed';
      // Return error page
      return {
        props: {
          _problemError: errorMessage,
        } as P,
      };
    }
  };
}
