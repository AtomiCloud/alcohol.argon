import type { NextApiRequest, NextApiResponse } from 'next';
import { configSchemas } from '@/config';
import { importedConfigurations } from '@/config/configs';
import { withApiConfig } from '@/lib/config/next';
import { ProblemRegistry } from '@/lib/problem/core';
import { PROBLEM_DEFINITIONS } from '@/problems/registry';

/**
 * GET /api/v1.0/error-info/[id]
 * Returns JSON schema with format: { schema: {...}, id: "...", title: "...", version: "..." }
 */
export default withApiConfig(
  process.env.LANDSCAPE || 'base',
  configSchemas,
  importedConfigurations,
  async (req: NextApiRequest, res: NextApiResponse, config) => {
    const problemRegistry = new ProblemRegistry(config.common.errorPortal, PROBLEM_DEFINITIONS);
    return problemRegistry.handleGetProblemSchema(req, res);
  },
);
