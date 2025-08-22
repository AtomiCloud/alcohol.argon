import { createModuleProvider, type ModuleProviderProps, type ProviderConfig } from '@/lib/module/providers';
import type { ApiTree, ClientTree } from '@/lib/api/core';
import { apiBuilder, type ApiModuleInput } from '@/lib/api/core/adapter';

type ApiProviderProps = ModuleProviderProps<ApiModuleInput>;

function createApiProvider<T extends ClientTree>(clientTree: T) {
  const module: ProviderConfig<ApiModuleInput, ApiTree<T>> = {
    name: 'Api',
    builder: input => apiBuilder(input, clientTree),
  };
  const { Provider, useContext } = createModuleProvider(module);

  function useSwaggerClients(): ApiTree<T> {
    const { resource } = useContext();
    return resource;
  }

  return {
    ApiProvider: Provider,
    useApiContext: useContext,
    useSwaggerClients,
  };
}

export { createApiProvider };
export type { ApiProviderProps };
