// Core configuration classes and types
export { ConfigRegistry } from './registry';
export type { ConfigSchemas, ValidatedConfigs } from './registry';

export { ConfigurationLoader } from './loader';
export type { ImportedConfigurations, RawConfigurations } from './loader';

export { ConfigurationMerger } from './merge';
export type { MergeOptions } from './merge';

export { ConfigurationValidator, ConfigValidationError, isConfigValidationError } from './validator';
export type { ValidationError } from './validator';

export { ConfigurationManager } from './manager';
export { BuildTimeProcessor } from './build-time';
export { createConfigManager } from './util';
