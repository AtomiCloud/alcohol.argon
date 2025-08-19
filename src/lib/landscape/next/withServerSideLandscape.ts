import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { envLandscapeSource, type LandscapeSource } from '@/lib/landscape/core/core';

export type ServerSideLandscapeHandler<P = Record<string, unknown>> = (
  context: GetServerSidePropsContext,
  landscape: string,
) => Promise<GetServerSidePropsResult<P>>;

export function withServerSideLandscape<P = Record<string, unknown>>(
  handler: ServerSideLandscapeHandler<P>,
  landscapeSource: LandscapeSource = envLandscapeSource,
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>> {
  return async (context: GetServerSidePropsContext) => await handler(context, landscapeSource());
}
