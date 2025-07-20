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

class ConfigurationLoader {
  constructor(
    private readonly landscape: string,
    private readonly fallbackToBase: boolean,
    private readonly arrayMerge?: (target: unknown[], source: unknown[]) => unknown[],
  ) {}

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
      if (this.landscape !== 'base' && configs.landscapes?.[this.landscape]) {
        const landscapeConfig = configs.landscapes[this.landscape];

        // Merge base with landscape-specific overrides using deepmerge
        const mergeOptions = {
          arrayMerge: this.arrayMerge || ((target: unknown[], source: unknown[]) => source),
        };

        result = deepmerge(result as Record<string, unknown>, landscapeConfig as Record<string, unknown>, mergeOptions);
      }
      return result;
    } catch (error) {
      if (this.fallbackToBase) {
        console.warn(
          `Failed to load ${configType} configuration for landscape '${this.landscape}', falling back to base:`,
          error,
        );
        return configs.base;
      }
      throw error;
    }
  }
}

export type { RawConfigurations, ImportedConfigurations };
export { ConfigurationLoader };
