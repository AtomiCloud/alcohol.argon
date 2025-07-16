// Core classes and types
export { ConfigRegistry } from './core/registry';
export type { ConfigSchemas, ValidatedConfigs } from './core/registry';

export { ConfigurationLoader } from './core/loader';
export type { ImportedConfigurations, RawConfigurations, LoaderConfig } from './core/loader';

export { ConfigurationMerger } from './core/merge';
export type { MergeOptions, MergerConfig } from './core/merge';

export { ConfigurationValidator, ConfigValidationError, isConfigValidationError } from './core/validator';
export type { ValidationError, ValidatorConfig } from './core/validator';

export { ConfigurationManager } from './core/manager';

// Factory for dependency injection
export {
  ConfigurationFactory,
  DEFAULT_LOADER_CONFIG,
  DEFAULT_MERGER_CONFIG,
  DEFAULT_VALIDATOR_CONFIG,
} from './core/factory';

// React integration
export { ConfigProvider } from './providers/ConfigProvider';
export type { ConfigProviderProps } from './providers/ConfigProvider';
export { useCommonConfig, useClientConfig, useServerConfig, useConfig, useConfigRegistry } from './providers/hooks';

// Next.js integration
export { withServerSideConfig } from './next/withServerSideConfig';
export type { ServerSideConfigHandler } from './next/withServerSideConfig';
export { withStaticConfig } from './next/withStaticConfig';
export type { StaticConfigHandler } from './next/withStaticConfig';
export { withApiConfig } from './next/withApiConfig';
export type { ApiConfigHandler } from './next/withApiConfig';
