import type { ConfigurationLoader, ImportedConfigurations } from './loader';
import type { ConfigurationMerger } from './merge';
import type { ConfigurationValidator } from './validator';
import { ConfigRegistry, type ConfigSchemas, type ValidatedConfigs } from './registry';

class ConfigurationManager<T extends ConfigSchemas> {
  private readonly loader: ConfigurationLoader;
  private readonly merger: ConfigurationMerger;
  private readonly validator: ConfigurationValidator;

  constructor(loader: ConfigurationLoader, merger: ConfigurationMerger, validator: ConfigurationValidator) {
    this.loader = loader;
    this.merger = merger;
    this.validator = validator;
  }

  createRegistry(schemas: T, importedConfigs: ImportedConfigurations): ConfigRegistry<T> {
    // Load raw configurations
    const rawConfigs = this.loader.load(importedConfigs);

    // Process environment variable overrides
    const envOverrides = this.merger.processEnvironmentVariables();

    // Merge configurations with environment overrides
    const mergedConfigs = {
      common: this.merger.merge(rawConfigs.common, {}, envOverrides.common || {}),
      client: this.merger.merge(rawConfigs.client, {}, envOverrides.client || {}),
      server: this.merger.merge(rawConfigs.server, {}, envOverrides.server || {}),
    };

    // Validate all configurations
    const validatedConfigs = this.validator.validateAll(mergedConfigs, schemas);

    // Create and return registry
    return new ConfigRegistry(validatedConfigs as ValidatedConfigs<T>);
  }
}

export { ConfigurationManager };
