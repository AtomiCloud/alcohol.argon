import { createNextAdapter, type NextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import { apiBuilder, type ApiModuleInput } from '@/lib/api/core/adapter';
import type { ApiTree, ClientTree } from '@/lib/api/core';

function createApiModule<T extends ClientTree>(clientTree: T): NextAdapter<ApiModuleInput, ApiTree<T>> {
  const module: NextAdapterConfig<ApiModuleInput, ApiTree<T>> = {
    name: 'Api',
    builder: input => apiBuilder(input, clientTree),
  };
  return createNextAdapter(module);
}

export { createApiModule };
