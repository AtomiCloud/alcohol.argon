import { ConfigurationLoader, type LoaderConfig } from './loader';
import { ConfigurationMerger, type MergerConfig } from './merge';
import { ConfigurationValidator, type ValidatorConfig } from './validator';
import { ConfigurationManager } from './manager';
import type { ConfigSchemas } from './registry';

// Default configurations for dependency injection
const DEFAULT_LOADER_CONFIG: LoaderConfig = {
  landscape: process.env.LANDSCAPE || 'base',
  fallbackToBase: true,
};

const DEFAULT_MERGER_CONFIG: MergerConfig = {
  envPrefix: 'ATOMI_',
  defaultArrayMerge: (_target, source) => source,
};

const DEFAULT_VALIDATOR_CONFIG: ValidatorConfig = {
  throwOnFirstError: false,
  errorFormatter: issue => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  },
};

// Factory for creating properly configured dependency tree
class ConfigurationFactory {
  static createManager<T extends ConfigSchemas>(
    loaderConfig: LoaderConfig = DEFAULT_LOADER_CONFIG,
    mergerConfig: MergerConfig = DEFAULT_MERGER_CONFIG,
    validatorConfig: ValidatorConfig = DEFAULT_VALIDATOR_CONFIG,
  ): ConfigurationManager<T> {
    // Create all dependencies first
    const loader = new ConfigurationLoader(loaderConfig);
    const merger = new ConfigurationMerger(mergerConfig);
    const validator = new ConfigurationValidator(validatorConfig);

    // Inject dependencies into manager
    return new ConfigurationManager<T>(loader, merger, validator);
  }

  static createDefaultManager<T extends ConfigSchemas>(): ConfigurationManager<T> {
    return ConfigurationFactory.createManager<T>();
  }
}

export { ConfigurationFactory, DEFAULT_LOADER_CONFIG, DEFAULT_MERGER_CONFIG, DEFAULT_VALIDATOR_CONFIG };
