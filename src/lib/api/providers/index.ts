import { createModuleProvider, type ModuleProviderProps } from '@/lib/module/providers';
import type { ApiTree, ClientTree } from '@/lib/api/core';
import { apiBuilder, type ApiModuleInput } from '@/lib/api/core/adapter';
import { type ProblemDefinitions, ProblemTransformer } from '@/lib/problem/core';

type ApiProviderProps<Y extends ProblemDefinitions> = ModuleProviderProps<ApiModuleInput<Y>>;

function createApiProvider<T extends ClientTree, Y extends ProblemDefinitions>(clientTree: T) {
  const { Provider, useContext } = createModuleProvider<ApiModuleInput<Y>, ApiTree<T>>({
    name: 'Api',
    builder: input => apiBuilder(input, clientTree),
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
