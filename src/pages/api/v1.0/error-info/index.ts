import type { NextApiRequest, NextApiResponse } from 'next';
import { withApiAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

/**
 * GET /api/v1.0/error-info
 * Returns array of problem IDs: ["entity_conflict", "unauthorized", "validation_error"]
 */
export default withApiAtomi(buildTime, async (req: NextApiRequest, res: NextApiResponse, { problemRegistry }) => {
  return problemRegistry.handleListProblems(req, res);
});
