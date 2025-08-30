import {
  type ConfigRegistry,
  type ConfigSchemas,
  createConfigManager,
  type ImportedConfigurations,
} from '@/lib/config/core';

interface ConfigModuleInput<T> {
  landscape: string;
  importedConfigurations: ImportedConfigurations;
  schemas: T;
}

function configBuilder<T extends ConfigSchemas>(input: ConfigModuleInput<T>): ConfigRegistry<T> {
  const { landscape, importedConfigurations, schemas } = input;
  const configManager = createConfigManager<T>(landscape);
  return configManager.createRegistry(schemas, importedConfigurations);
}

export { configBuilder };
export type { ConfigModuleInput };
