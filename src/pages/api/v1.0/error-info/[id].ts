import type { NextApiRequest, NextApiResponse } from 'next';
import { problemRegistry } from '@/problems/registry';

/**
 * GET /api/v1.0/error-info/[id]
 * Returns JSON schema with format: { schema: {...}, id: "...", title: "...", version: "..." }
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return problemRegistry.handleGetProblemSchema(req, res);
}
