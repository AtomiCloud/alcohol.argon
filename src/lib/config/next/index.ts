import { createNextAdapter, type NextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import { configBuilder, type ConfigModuleInput } from '@/lib/config/adapter';
import type { ConfigRegistry, ConfigSchemas } from '@/lib/config/core';

function createConfigModule<T extends ConfigSchemas>(): NextAdapter<ConfigModuleInput<T>, ConfigRegistry<T>> {
  const module: NextAdapterConfig<ConfigModuleInput<T>, ConfigRegistry<T>> = {
    name: 'Config',
    builder: input => configBuilder(input),
  };
  return createNextAdapter(module);
}

export { createConfigModule };
