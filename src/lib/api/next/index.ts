import { createNextAdapter, type NextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import { apiBuilder, type ApiModuleInput } from '@/lib/api/core/adapter';
import type { ApiTree, ClientTree } from '@/lib/api/core';
import type { ProblemDefinitions } from '@/lib/problem/core';

function createApiModule<T extends ClientTree, Y extends ProblemDefinitions>(): NextAdapter<
  ApiModuleInput<T, Y>,
  ApiTree<T>
> {
  const module: NextAdapterConfig<ApiModuleInput<T, Y>, ApiTree<T>> = {
    name: 'Api',
    builder: input => apiBuilder(input),
  };
  return createNextAdapter(module);
}

export { createApiModule };
