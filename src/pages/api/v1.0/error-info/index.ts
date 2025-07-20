import type { NextApiRequest, NextApiResponse } from 'next';
import { configSchemas } from '@/config';
import { importedConfigurations } from '@/config/configs';
import { withApiConfig } from '@/lib/config/next';
import { ProblemRegistry } from '@/lib/problem';
import { PROBLEM_DEFINITIONS } from '@/problems/registry';

/**
 * GET /api/v1.0/error-info
 * Returns array of problem IDs: ["entity_conflict", "unauthorized", "validation_error"]
 */
export default withApiConfig(
  process.env.LANDSCAPE || 'base',
  configSchemas,
  importedConfigurations,
  async (req: NextApiRequest, res: NextApiResponse, config) => {
    const problemRegistry = new ProblemRegistry(config.common.errorPortal, PROBLEM_DEFINITIONS);
    return problemRegistry.handleListProblems(req, res);
  },
);
