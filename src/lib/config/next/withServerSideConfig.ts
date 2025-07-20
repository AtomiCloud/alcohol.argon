import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ConfigRegistry, ConfigSchemas } from '../core/registry';
import { isConfigValidationError, ConfigurationValidator } from '../core/validator';
import type { ImportedConfigurations } from '../core/loader';
import { createConfigManager } from '@/lib/config/core';

export type ServerSideConfigHandler<T extends ConfigSchemas, P = Record<string, unknown>> = (
  context: GetServerSidePropsContext,
  config: ConfigRegistry<T>,
) => Promise<GetServerSidePropsResult<P>>;

export function withServerSideConfig<T extends ConfigSchemas, P = Record<string, unknown>>(
  landscape: string,
  schemas: T,
  importedConfigurations: ImportedConfigurations,
  handler: ServerSideConfigHandler<T, P>,
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>> {
  return async (context: GetServerSidePropsContext) => {
    try {
      const configManager = createConfigManager(landscape);
      const configRegistry = configManager.createRegistry(schemas, importedConfigurations);

      // Call the user's handler with the config registry
      const result = await handler(context, configRegistry);

      // If the result contains props, ensure we don't expose server config to client
      if ('props' in result) {
        return {
          ...result,
          props: {
            ...result.props,
            // Only expose common and client config to the client
            _config: {
              common: configRegistry.common,
              client: configRegistry.client,
            },
          },
        };
      }

      return result;
    } catch (error) {
      console.error('Configuration error in getServerSideProps:', error);

      let errorMessage = 'Configuration initialization failed';

      if (isConfigValidationError(error)) {
        const validator = new ConfigurationValidator(false);
        errorMessage = validator.formatError(error);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Return error page
      return {
        props: {
          _configError: errorMessage,
        } as P,
      };
    }
  };
}
