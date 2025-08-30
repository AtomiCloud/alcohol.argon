import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextApiRequest,
  NextApiResponse,
} from 'next';

type ApiHandler<TOutput> = (req: NextApiRequest, res: NextApiResponse, resource: TOutput) => Promise<void> | void;

type ServerSideHandler<TOutput, P> = (
  context: GetServerSidePropsContext,
  resource: TOutput,
) => Promise<GetServerSidePropsResult<P>>;

type StaticHandler<TOutput, P> = (
  context: GetStaticPropsContext,
  resource: TOutput,
) => Promise<GetStaticPropsResult<P>>;

type WithApiHandler<TInput, TOutput> = (
  config: TInput,
  handler: ApiHandler<TOutput>,
) => (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

type WithServerSideHandler<TInput, TOutput, P = unknown> = (
  config: TInput,
  handler: ServerSideHandler<TOutput, P>,
) => (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>>;

type WithStaticHandler<TInput, TOutput, P = unknown> = (
  config: TInput,
  handler: StaticHandler<TOutput, P>,
) => (context: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>>;

export type { ApiHandler, ServerSideHandler, StaticHandler, WithApiHandler, WithServerSideHandler, WithStaticHandler };
