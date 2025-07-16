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
    configType: string,
    configs: { base: unknown; landscapes?: Record<string, unknown> },
  ): unknown {
    try {
      // Try to load landscape-specific config first
      if (this.config.landscape !== 'base' && configs.landscapes?.[this.config.landscape]) {
        return configs.landscapes[this.config.landscape];
      }

      // Fallback to base config
      return configs.base;
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
