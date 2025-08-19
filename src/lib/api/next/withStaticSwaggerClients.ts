import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import { type ApiTree, type ClientTree, createFromClientTree } from '../core/swagger-adapter';

export type StaticSwaggerClientsHandler<T extends ClientTree, P = Record<string, unknown>> = (
  context: GetStaticPropsContext,
  api: ApiTree<T>,
) => Promise<GetStaticPropsResult<P>>;

export function withStaticSwaggerClients<T extends ClientTree, P = Record<string, unknown>>(
  clientTree: T,
  handler: StaticSwaggerClientsHandler<T, P>,
): (context: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>> {
  return async (context: GetStaticPropsContext) => {
    try {
      const apiTree = createFromClientTree(clientTree);
      return await handler(context, apiTree);
    } catch (error) {
      console.error('Swagger Clients init error in API route:', error);

      const errorMessage = error instanceof Error ? error.message : 'Swagger Clients initialization failed';

      return {
        props: {
          _problemError: errorMessage,
        } as P,
      };
    }
  };
}
