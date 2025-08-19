import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { type ApiTree, type ClientTree, createFromClientTree } from '../core/swagger-adapter';

export type ServerSideSwaggerClientsHandler<T extends ClientTree, P = Record<string, unknown>> = (
  context: GetServerSidePropsContext,
  api: ApiTree<T>,
) => Promise<GetServerSidePropsResult<P>>;

export function withServerSideSwaggerClients<T extends ClientTree, P = Record<string, unknown>>(
  clientTree: T,
  handler: ServerSideSwaggerClientsHandler<T, P>,
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>> {
  return async (context: GetServerSidePropsContext) => {
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
