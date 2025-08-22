import {
  type ConfigRegistry,
  type ConfigSchemas,
  createConfigManager,
  type ImportedConfigurations,
} from '@/lib/config/core';

interface ConfigModuleInput {
  landscape: string;
  importedConfigurations: ImportedConfigurations;
}

function configBuilder<T extends ConfigSchemas>(input: ConfigModuleInput, schemas: T): ConfigRegistry<T> {
  const { landscape, importedConfigurations } = input;
  const configManager = createConfigManager<T>(landscape);
  return configManager.createRegistry(schemas, importedConfigurations);
}

export { configBuilder };
export type { ConfigModuleInput };
