import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { type ConfigSchemas, type ValidatedConfigs, registerSchemas, isRegistryInitialized } from '../core/registry';
import { loadConfigurations } from '../core/loader';
import { importedConfigurations } from '../../../config/configs';
import { mergeConfigurations, processEnvironmentVariables } from '../core/merge';
import { validateAllConfigurations, isConfigValidationError, getValidationErrorMessage } from '../core/validator';

export type ServerSideConfigHandler<T extends ConfigSchemas, P = Record<string, unknown>> = (
  context: GetServerSidePropsContext,
  config: ValidatedConfigs<T>,
) => Promise<GetServerSidePropsResult<P>>;

export function withServerSideConfig<T extends ConfigSchemas, P = Record<string, unknown>>(
  schemas: T,
  handler: ServerSideConfigHandler<T, P>,
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>> {
  return async (context: GetServerSidePropsContext) => {
    try {
      // Initialize configuration if not already done
      if (!isRegistryInitialized()) {
        await initializeConfiguration(schemas);
      }

      // Load raw configurations
      const rawConfigs = loadConfigurations(importedConfigurations);

      // Process environment variable overrides
      const envOverrides = processEnvironmentVariables();

      // Merge configurations with environment overrides
      const mergedConfigs = {
        common: mergeConfigurations(rawConfigs.common, {}, envOverrides.common || {}),
        client: mergeConfigurations(rawConfigs.client, {}, envOverrides.client || {}),
        server: mergeConfigurations(rawConfigs.server, {}, envOverrides.server || {}),
      };

      // Validate all configurations
      const validatedConfigs = validateAllConfigurations(mergedConfigs, schemas);

      // Call the user's handler with the validated config
      const result = await handler(context, validatedConfigs as ValidatedConfigs<T>);

      // If the result contains props, ensure we don't expose server config to client
      if ('props' in result) {
        return {
          ...result,
          props: {
            ...result.props,
            // Only expose common and client config to the client
            _config: {
              common: validatedConfigs.common,
              client: validatedConfigs.client,
            },
          },
        };
      }

      return result;
    } catch (error) {
      console.error('Configuration error in getServerSideProps:', error);

      let errorMessage = 'Configuration initialization failed';

      if (isConfigValidationError(error)) {
        errorMessage = getValidationErrorMessage(error);
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
