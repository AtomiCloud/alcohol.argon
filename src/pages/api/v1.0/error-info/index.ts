import type { NextApiRequest, NextApiResponse } from 'next';
import { problemRegistry } from '@/problems/registry';

/**
 * GET /api/v1.0/error-info
 * Returns array of problem IDs: ["entity_conflict", "unauthorized", "validation_error"]
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return problemRegistry.handleListProblems(req, res);
}
