// Core registry functions
export { registerSchemas, getValidatedConfig, getSchema, isRegistryInitialized } from './core/registry';
export type { ConfigSchemas, ValidatedConfigs } from './core/registry';

// Configuration loading and processing
export { loadConfigurations } from './core/loader';
export type { ImportedConfigurations, RawConfigurations } from './core/loader';
export { mergeConfigurations, processEnvironmentVariables } from './core/merge';
export {
  validateConfiguration,
  validateAllConfigurations,
  isConfigValidationError,
  getValidationErrorMessage,
} from './core/validator';
export type { ValidationError } from './core/validator';

// React integration
export { ConfigProvider } from './providers/ConfigProvider';
export type { ConfigProviderProps } from './providers/ConfigProvider';
export { useCommonConfig, useClientConfig, useServerConfig, useConfig } from './providers/hooks';

// Next.js integration
export { withServerSideConfig } from './next/withServerSideConfig';
export type { ServerSideConfigHandler } from './next/withServerSideConfig';
export { withStaticConfig } from './next/withStaticConfig';
export type { StaticConfigHandler } from './next/withStaticConfig';
