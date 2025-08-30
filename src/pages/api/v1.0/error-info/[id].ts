import type { NextApiRequest, NextApiResponse } from 'next';
import { withApiAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

/**
 * GET /api/v1.0/error-info/[id]
 * Returns JSON schema with format: { schema: {...}, id: "...", title: "...", version: "..." }
 */
export default withApiAtomi(buildTime, async (req: NextApiRequest, res: NextApiResponse, { problemRegistry }) => {
  return problemRegistry.handleGetProblemSchema(req, res);
});
