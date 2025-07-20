import type { NextApiRequest, NextApiResponse } from 'next';
import type { ConfigRegistry, ConfigSchemas } from '../core/registry';
import { isConfigValidationError, ConfigurationValidator } from '../core/validator';
import type { ImportedConfigurations } from '../core/loader';
import { createConfigManager } from '@/lib/config/core';

export type ApiConfigHandler<T extends ConfigSchemas> = (
  req: NextApiRequest,
  res: NextApiResponse,
  config: ConfigRegistry<T>,
) => Promise<void> | void;

export function withApiConfig<T extends ConfigSchemas>(
  landscape: string,
  schemas: T,
  importedConfigurations: ImportedConfigurations,
  handler: ApiConfigHandler<T>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const configManager = createConfigManager(landscape);
      const configRegistry = configManager.createRegistry(schemas, importedConfigurations);

      // Call the user's handler with the config registry
      await handler(req, res, configRegistry);
    } catch (error) {
      console.error('Configuration error in API route:', error);

      let errorMessage = 'Configuration initialization failed';

      if (isConfigValidationError(error)) {
        const validator = new ConfigurationValidator(false);
        errorMessage = validator.formatError(error);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Return error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'Configuration error occurred',
      });
    }
  };
}
