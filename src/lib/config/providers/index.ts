import { createModuleProvider, type ModuleProviderProps } from '@/lib/module/providers';
import type { ConfigRegistry, ConfigSchemas } from '../core';
import { configBuilder, type ConfigModuleInput } from '../adapter';

type ConfigProviderProps<T extends ConfigSchemas> = ModuleProviderProps<ConfigModuleInput<T>>;

function createConfigProvider<T extends ConfigSchemas>() {
  const { useContext, Provider } = createModuleProvider<ConfigModuleInput<T>, ConfigRegistry<T>>({
    name: 'Config',
    builder: input => configBuilder(input),
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
