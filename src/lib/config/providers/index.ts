import { createModuleProvider, type ModuleProviderProps } from '@/lib/module/providers';
import type { ConfigRegistry, ConfigSchemas } from '../core';
import { configBuilder, type ConfigModuleInput } from '../adapter';

type ConfigProviderProps = ModuleProviderProps<ConfigModuleInput>;

function createConfigProvider<T extends ConfigSchemas>(schemas: T) {
  const { useContext, Provider } = createModuleProvider<ConfigModuleInput, ConfigRegistry<T>>({
    name: 'Config',
    builder: input => configBuilder(input, schemas),
  });

  function useCommonConfig() {
    const {
      resource: { common },
    } = useContext();
    return common;
  }

  function useClientConfig() {
    const {
      resource: { client },
    } = useContext();
    return client;
  }

  function useConfig() {
    return {
      common: useCommonConfig(),
      client: useClientConfig(),
    };
  }

  function useConfigRegistry(): ConfigRegistry<T> {
    const { resource } = useContext();
    return resource;
  }

  return {
    useConfigContext: useContext,
    ConfigProvider: Provider,
    useCommonConfig,
    useClientConfig,
    useConfig,
    useConfigRegistry,
  };
}

export { createConfigProvider };
export type { ConfigProviderProps };
