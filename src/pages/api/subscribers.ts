import { neon } from '@neondatabase/serverless';
import { withApiAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

const GOAL = 100;

export default withApiAtomi(buildTime, async (req, res, { config }) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const sql = neon(config.server.db.url);

    // Ensure table exists (mirrors subscribe endpoint)
    await sql`CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      source TEXT,
      subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`;

    const rows = await sql`SELECT COUNT(*)::int AS count FROM subscriptions`;
    const count = (rows?.[0]?.count as number) ?? 0;

    return res.status(200).json({ ok: true, count, goal: GOAL });
  } catch (error) {
    console.error('[subscribers] error:', error);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});
