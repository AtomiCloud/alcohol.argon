import type { NextApiRequest, NextApiResponse } from 'next';
import type { ErrorReporter, ProblemConfig, ProblemDefinitions } from '@/lib/problem/core';
import { ProblemRegistry, ProblemTransformer } from '@/lib/problem/core';

export type ApiProblemHandler<T extends ProblemDefinitions> = (
  req: NextApiRequest,
  res: NextApiResponse,
  problemRegistry: ProblemRegistry<T>,
  problemTransformer: ProblemTransformer<T>,
) => Promise<void> | void;

export function withApiProblem<T extends ProblemDefinitions>(
  config: ProblemConfig,
  problemDefinition: T,
  errorReporter: ErrorReporter,
  handler: ApiProblemHandler<T>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const problemRegistry = new ProblemRegistry(config, problemDefinition);
      const problemTransformer = new ProblemTransformer(problemRegistry, errorReporter);
      // Call the user's handler with the config registry
      await handler(req, res, problemRegistry, problemTransformer);
    } catch (error) {
      console.error('Problem error in API route:', error);

      const errorMessage = error instanceof Error ? error.message : 'Problem initialization failed';
      // Return error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'Problem initialization error occurred',
      });
    }
  };
}
