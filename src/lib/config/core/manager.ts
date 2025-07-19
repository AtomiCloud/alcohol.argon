import type { ConfigurationLoader, ImportedConfigurations } from './loader';
import type { ConfigurationMerger } from './merge';
import { ConfigRegistry, type ConfigSchemas, type ValidatedConfigs } from './registry';
import type { ConfigurationValidator } from './validator';

class ConfigurationManager<T extends ConfigSchemas> {
  private readonly loader: ConfigurationLoader;
  private readonly merger: ConfigurationMerger;
  private readonly validator: ConfigurationValidator;

  constructor(loader: ConfigurationLoader, merger: ConfigurationMerger, validator: ConfigurationValidator) {
    this.loader = loader;
    this.merger = merger;
    this.validator = validator;
  }

  /**
   * Create registry with 4-tier configuration hierarchy support
   */
  createRegistry(schemas: T, importedConfigs: ImportedConfigurations): ConfigRegistry<T> {
    // Load raw configurations
    const rawConfigs = this.loader.load(importedConfigs);

    // Process build-time environment variables (if available)
    const buildTimeOverrides = this.merger.processBuildTimeEnvironmentVariables();

    // Process runtime environment variable overrides
    const runtimeOverrides = this.merger.processEnvironmentVariables();

    // Merge configurations using 4-tier hierarchy: base => landscape => build-time => runtime
    const mergedConfigs = {
      common: this.merger.merge(
        rawConfigs.common,
        {}, // landscape overrides (handled in loader)
        buildTimeOverrides.common || {},
        runtimeOverrides.common || {},
      ),
      client: this.merger.merge(rawConfigs.client, {}, buildTimeOverrides.client || {}, runtimeOverrides.client || {}),
      server: this.merger.merge(rawConfigs.server, {}, buildTimeOverrides.server || {}, runtimeOverrides.server || {}),
    };

    // Validate all configurations
    const validatedConfigs = this.validator.validateAll(mergedConfigs, schemas);

    // Create and return registry
    return new ConfigRegistry(validatedConfigs as ValidatedConfigs<T>);
  }
}

export { ConfigurationManager };
