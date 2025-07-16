export interface RawConfigurations {
  common: unknown;
  client: unknown;
  server: unknown;
}

export interface ImportedConfigurations {
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

// Configuration loader that accepts user-imported raw configurations
export function loadConfigurations(importedConfigs: ImportedConfigurations): RawConfigurations {
  const landscape = process.env.LANDSCAPE || 'base';

  // Load common configuration
  const commonConfig = loadConfigForType('common', landscape, importedConfigs.common);

  // Load client configuration
  const clientConfig = loadConfigForType('client', landscape, importedConfigs.client);

  // Load server configuration
  const serverConfig = loadConfigForType('server', landscape, importedConfigs.server);

  return {
    common: commonConfig,
    client: clientConfig,
    server: serverConfig,
  };
}

function loadConfigForType(
  configType: string,
  landscape: string,
  configs: { base: unknown; landscapes?: Record<string, unknown> },
): unknown {
  try {
    // Try to load landscape-specific config first
    if (landscape !== 'base' && configs.landscapes?.[landscape]) {
      return configs.landscapes[landscape];
    }

    // Fallback to base config
    return configs.base;
  } catch (error) {
    console.warn(
      `Failed to load ${configType} configuration for landscape '${landscape}', falling back to base:`,
      error,
    );

    // Final fallback to base config
    return configs.base;
  }
}
