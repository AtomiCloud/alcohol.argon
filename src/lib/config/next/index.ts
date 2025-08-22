import { createNextAdapter, type NextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import { configBuilder, type ConfigModuleInput } from '@/lib/config/adapter';
import type { ConfigRegistry, ConfigSchemas } from '@/lib/config/core';

function createConfigModule<T extends ConfigSchemas>(schemas: T): NextAdapter<ConfigModuleInput, ConfigRegistry<T>> {
  const module: NextAdapterConfig<ConfigModuleInput, ConfigRegistry<T>> = {
    name: 'Config',
    builder: input => configBuilder(input, schemas),
  };
  return createNextAdapter(module);
}

export { createConfigModule };
