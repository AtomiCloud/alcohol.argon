import type { NextApiRequest, NextApiResponse } from 'next';
import { importedConfigurations } from '@/config/configs';
import { ProblemRegistry } from '@/lib/problem/core';
import { PROBLEM_DEFINITIONS } from '@/problems/registry';
import { withApiConfig } from '@/adapters/external/next';

/**
 * GET /api/v1.0/error-info
 * Returns array of problem IDs: ["entity_conflict", "unauthorized", "validation_error"]
 */
export default withApiConfig(
  {
    landscape: process.env.LANDSCAPE || 'base',
    importedConfigurations,
  },
  async (req: NextApiRequest, res: NextApiResponse, config) => {
    const problemRegistry = new ProblemRegistry(config.common.errorPortal, PROBLEM_DEFINITIONS);
    return problemRegistry.handleListProblems(req, res);
  },
);
