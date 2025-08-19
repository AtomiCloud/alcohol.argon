import type { NextApiRequest, NextApiResponse } from 'next';
import { FaroErrorReporterFactory } from '@/adapters/problem-reporter/core/problem-reporter';
import type { ErrorReporter } from '@/lib/problem/core';

export type ApiErrorReporterHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  reporter: ErrorReporter,
) => Promise<void> | void;

export function withApiErrorReporter<T>(
  faro: boolean,
  handler: ApiErrorReporterHandler,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const reporter = new FaroErrorReporterFactory(faro).get();
      // Call the user's handler with the config registry
      await handler(req, res, reporter);
    } catch (error) {
      console.error('Error Reporter initialization error in API route:', error);

      const errorMessage = error instanceof Error ? error.message : 'Error Reporter initialization failed';
      // Return error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'Error Reporter initialization error occurred',
      });
    }
  };
}
