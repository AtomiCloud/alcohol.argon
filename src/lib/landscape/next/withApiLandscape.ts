import type { NextApiRequest, NextApiResponse } from 'next';
import { envLandscapeSource, type LandscapeSource } from '@/lib/landscape/core/core';

export type ApiLandscapeHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  landscape: string,
) => Promise<void> | void;

export function withApiLandscape(
  handler: ApiLandscapeHandler,
  landscapeSource: LandscapeSource = envLandscapeSource,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => await handler(req, res, landscapeSource());
}
