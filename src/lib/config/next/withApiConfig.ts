import type { NextApiRequest, NextApiResponse } from 'next';
import type { ConfigRegistry, ConfigSchemas } from '../core/registry';
import { ConfigurationFactory, DEFAULT_VALIDATOR_CONFIG } from '../core/factory';
import { isConfigValidationError, ConfigurationValidator } from '../core/validator';
import { importedConfigurations } from '../../../config/configs';

export type ApiConfigHandler<T extends ConfigSchemas> = (
  req: NextApiRequest,
  res: NextApiResponse,
  config: ConfigRegistry<T>,
) => Promise<void> | void;

export function withApiConfig<T extends ConfigSchemas>(
  schemas: T,
  handler: ApiConfigHandler<T>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Create configuration manager and registry via factory
      const configManager = ConfigurationFactory.createDefaultManager<T>();
      const configRegistry = configManager.createRegistry(schemas, importedConfigurations);

      // Call the user's handler with the config registry
      await handler(req, res, configRegistry);
    } catch (error) {
      console.error('Configuration error in API route:', error);

      let errorMessage = 'Configuration initialization failed';

      if (isConfigValidationError(error)) {
        const validator = new ConfigurationValidator(DEFAULT_VALIDATOR_CONFIG);
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
