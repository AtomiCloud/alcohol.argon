import type { NextApiRequest, NextApiResponse } from 'next';
import {
  type ConfigSchemas,
  type ValidatedConfigs,
  registerSchemas,
  isRegistryInitialized,
  getValidatedConfig,
} from '../core/registry';
import { loadConfigurations } from '../core/loader';
import { importedConfigurations } from '../../../config/configs';
import { mergeConfigurations, processEnvironmentVariables } from '../core/merge';
import { validateAllConfigurations, isConfigValidationError, getValidationErrorMessage } from '../core/validator';

export type ApiConfigHandler<T extends ConfigSchemas> = (
  req: NextApiRequest,
  res: NextApiResponse,
  config: ValidatedConfigs<T>,
) => Promise<void> | void;

export function withApiConfig<T extends ConfigSchemas>(
  schemas: T,
  handler: ApiConfigHandler<T>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Initialize configuration if not already done
      if (!isRegistryInitialized()) {
        await initializeConfiguration(schemas);
      }

      // Get validated configs from registry after initialization
      const validatedConfigs = {
        common: getValidatedConfig('common'),
        client: getValidatedConfig('client'),
        server: getValidatedConfig('server'),
      };

      // Call the user's handler with the validated config
      await handler(req, res, validatedConfigs as ValidatedConfigs<T>);
    } catch (error) {
      console.error('Configuration error in API route:', error);

      let errorMessage = 'Configuration initialization failed';

      if (isConfigValidationError(error)) {
        errorMessage = getValidationErrorMessage(error);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Return error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development'
          ? errorMessage
          : 'Configuration error occurred',
      });
    }
  };
}

async function initializeConfiguration<T extends ConfigSchemas>(schemas: T): Promise<void> {
  const rawConfigs = loadConfigurations(importedConfigurations);
  const envOverrides = processEnvironmentVariables();

  const mergedConfigs = {
    common: mergeConfigurations(rawConfigs.common, {}, envOverrides.common || {}),
    client: mergeConfigurations(rawConfigs.client, {}, envOverrides.client || {}),
    server: mergeConfigurations(rawConfigs.server, {}, envOverrides.server || {}),
  };

  const validatedConfigs = validateAllConfigurations(mergedConfigs, schemas);
  registerSchemas(schemas, validatedConfigs as ValidatedConfigs<T>);
}
