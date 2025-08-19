import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import { envLandscapeSource, type LandscapeSource } from '@/lib/landscape/core/core';

export type StaticLandscapeHandler<P = Record<string, unknown>> = (
  context: GetStaticPropsContext,
  landscape: string,
) => Promise<GetStaticPropsResult<P>>;

export function withStaticLandscape<P = Record<string, unknown>>(
  handler: StaticLandscapeHandler<P>,
  landscapeSource: LandscapeSource = envLandscapeSource,
): (context: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>> {
  return async (context: GetStaticPropsContext) => {
    return await handler(context, landscapeSource());
  };
}
