import type { NextApiHandler, NextApiResponse } from 'next';
import type { IAuthStateRetriever } from '@/lib/auth/core/types';
import type { Result } from '@/lib/monads/result';

async function resultResult<T, P>(result: Result<T, P>, res: NextApiResponse): Promise<void> {
  const serial = await result.serial();
  await result.match({
    err: async _ => {
      res.json(serial);
      res.status(400);
    },
    ok: async _ => {
      res.json(serial);
      res.status(200);
    },
  });
  res.end();
}

async function handleAuthData(
  action: 'claims' | 'user' | 'tokens' | 'force_tokens',
  auth: IAuthStateRetriever,
  res: NextApiResponse,
): Promise<void> {
  if (action === 'claims') return resultResult(auth.getClaims(), res);
  if (action === 'user') return resultResult(auth.getUserInfo(), res);
  if (action === 'tokens') return resultResult(auth.getTokenSet(), res);
  if (action === 'force_tokens') return resultResult(auth.forceTokenSet(), res);
}

const authStateApiHandler: (auth: IAuthStateRetriever) => NextApiHandler =
  (auth: IAuthStateRetriever) => async (req, res) => {
    const { action } = req.query;
    if (action && typeof action === 'string' && ['claims', 'user', 'tokens'].includes(action))
      return await handleAuthData(action as 'claims' | 'user' | 'tokens', auth, res);
    res.status(404);
    res.end();
  };

export { authStateApiHandler };
