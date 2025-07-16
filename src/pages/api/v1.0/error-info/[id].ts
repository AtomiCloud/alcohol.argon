import type { NextApiRequest, NextApiResponse } from 'next';
import { createProblemRegistry } from '@/problems/registry';
import { withApiConfig } from '@/lib/config';
import { configSchemas } from '@/config';

/**
 * GET /api/v1.0/error-info/[id]
 * Returns JSON schema with format: { schema: {...}, id: "...", title: "...", version: "..." }
 */
export default withApiConfig(configSchemas, async (req: NextApiRequest, res: NextApiResponse, config) => {
  const problemRegistry = createProblemRegistry(config.common.errorPortal);
  return problemRegistry.handleGetProblemSchema(req, res);
});
