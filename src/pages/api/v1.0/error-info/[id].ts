import type { NextApiRequest, NextApiResponse } from 'next';
import { ProblemRegistry } from '@/lib/problem/core';
import { PROBLEM_DEFINITIONS } from '@/problems/registry';
import { withApiConfig } from '@/adapters/external/next';
import { importedConfigurations } from '@/config/configs';

/**
 * GET /api/v1.0/error-info/[id]
 * Returns JSON schema with format: { schema: {...}, id: "...", title: "...", version: "..." }
 */
export default withApiConfig(
  {
    landscape: process.env.LANDSCAPE || 'base',
    importedConfigurations,
  },
  async (req: NextApiRequest, res: NextApiResponse, config) => {
    const problemRegistry = new ProblemRegistry(config.common.errorPortal, PROBLEM_DEFINITIONS);
    return problemRegistry.handleGetProblemSchema(req, res);
  },
);
