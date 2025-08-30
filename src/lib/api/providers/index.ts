import { createModuleProvider, type ModuleProviderProps } from '@/lib/module/providers';
import type { ApiTree, ClientTree } from '@/lib/api/core';
import { apiBuilder, type ApiModuleInput } from '@/lib/api/core/adapter';
import type { ProblemDefinitions } from '@/lib/problem/core';

type ApiProviderProps<T extends ClientTree, Y extends ProblemDefinitions> = ModuleProviderProps<ApiModuleInput<T, Y>>;

function createApiProvider<T extends ClientTree, Y extends ProblemDefinitions>() {
  const { Provider, useContext } = createModuleProvider<ApiModuleInput<T, Y>, ApiTree<T>>({
    name: 'Api',
    builder: input => apiBuilder(input),
  });

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
