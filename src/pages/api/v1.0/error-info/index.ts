import type { NextApiRequest, NextApiResponse } from 'next';
import { createProblemRegistry } from '@/problems/registry';
import { withApiConfig } from '@/lib/config';
import { configSchemas } from '@/config';
import { importedConfigurations } from '@/config/configs';

/**
 * GET /api/v1.0/error-info
 * Returns array of problem IDs: ["entity_conflict", "unauthorized", "validation_error"]
 */
export default withApiConfig(
  configSchemas,
  importedConfigurations,
  async (req: NextApiRequest, res: NextApiResponse, config) => {
    const problemRegistry = createProblemRegistry(config.common.errorPortal);
    return problemRegistry.handleListProblems(req, res);
  },
);
