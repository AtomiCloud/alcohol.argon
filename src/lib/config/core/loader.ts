import deepmerge from 'deepmerge';
interface RawConfigurations {
  common: unknown;
  client: unknown;
  server: unknown;
}

interface ImportedConfigurations {
  common: {
    base: unknown;
    landscapes?: Record<string, unknown>;
  };
  client: {
    base: unknown;
    landscapes?: Record<string, unknown>;
  };
  server: {
    base: unknown;
    landscapes?: Record<string, unknown>;
  };
}

interface LoaderConfig {
  landscape: string;
  fallbackToBase: boolean;
  arrayMerge?: (target: unknown[], source: unknown[]) => unknown[];
}

class ConfigurationLoader {
  private readonly config: LoaderConfig;

  constructor(config: LoaderConfig) {
    this.config = config;
  }

  load(importedConfigs: ImportedConfigurations): RawConfigurations {
    return {
      common: this.loadConfigForType('common', importedConfigs.common),
      client: this.loadConfigForType('client', importedConfigs.client),
      server: this.loadConfigForType('server', importedConfigs.server),
    };
  }

  private loadConfigForType(
    configType: 'common' | 'client' | 'server',
    configs: { base: unknown; landscapes?: Record<string, unknown> },
  ): unknown {
    try {
      // Start with base configuration
      let result = configs.base;

      // If we have a landscape-specific config and it's not 'base', merge it with base
      if (this.config.landscape !== 'base' && configs.landscapes?.[this.config.landscape]) {
        const landscapeConfig = configs.landscapes[this.config.landscape];

        // Merge base with landscape-specific overrides using deepmerge
        const mergeOptions = {
          arrayMerge: this.config.arrayMerge || ((target: unknown[], source: unknown[]) => source),
        };

        result = deepmerge(result as Record<string, unknown>, landscapeConfig as Record<string, unknown>, mergeOptions);
      }

      return result;
    } catch (error) {
      if (this.config.fallbackToBase) {
        console.warn(
          `Failed to load ${configType} configuration for landscape '${this.config.landscape}', falling back to base:`,
          error,
        );
        return configs.base;
      }
      throw error;
    }
  }
}

export type { RawConfigurations, ImportedConfigurations, LoaderConfig };
export { ConfigurationLoader };
