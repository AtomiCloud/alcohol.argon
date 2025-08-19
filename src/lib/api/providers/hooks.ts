import type { ApiTree, ClientTree } from '../core/swagger-adapter';
import { useSwaggerClientsContext } from './SwaggerClientsProvider';

function useSwaggerClients<T extends ClientTree>(): ApiTree<T> {
  const { api } = useSwaggerClientsContext<T>();
  return api;
}

export { useSwaggerClients };
