import { type ApiTree, type ClientTree, createFromClientTree } from '@/lib/api/core/swagger-adapter';

// biome-ignore lint/complexity/noBannedTypes: conform to interface
type ApiModuleInput = {};

function apiBuilder<T extends ClientTree>(input: ApiModuleInput, clientTree: T): ApiTree<T> {
  return createFromClientTree(clientTree);
}

export { apiBuilder, type ApiModuleInput };
