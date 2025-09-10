import { withApiAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import { authStateApiHandler } from '@/lib/auth/next/auth';

export default withApiAtomi(buildTime, async (req, res, { auth }) => {
  await authStateApiHandler(auth.retriever)(req, res);
});
