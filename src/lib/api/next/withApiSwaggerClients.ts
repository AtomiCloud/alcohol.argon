import type { NextApiRequest, NextApiResponse } from 'next';
import { type ApiTree, type ClientTree, createFromClientTree } from '../core/swagger-adapter';

export type ApiSwaggerClientsHandler<T extends ClientTree> = (
  req: NextApiRequest,
  res: NextApiResponse,
  clientTree: ApiTree<T>,
) => Promise<void> | void;

export function withApiSwaggerClients<T extends ClientTree>(
  clientTree: T,
  handler: ApiSwaggerClientsHandler<T>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const apis = createFromClientTree(clientTree);
      // Call the user's handler with the config registry
      await handler(req, res, apis);
    } catch (error) {
      console.error('Swagger Client error in API route:', error);

      const errorMessage = error instanceof Error ? error.message : 'Swagger Client initialization failed';
      // Return error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'Swagger Client initialization error occurred',
      });
    }
  };
}
