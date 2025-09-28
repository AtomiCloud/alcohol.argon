import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { withApiAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

const SubscribeSchema = z.object({
  email: z.email(),
  source: z.string().optional(),
});

export default withApiAtomi(buildTime, async (req, res, { config }) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const parsed = SubscribeSchema.safeParse(data);
    if (!parsed.success) {
      console.error('[subscribe] invalid payload', parsed.error);
      return res.status(400).json({ ok: false, error: 'invalid_email' });
    }

    const payload = parsed.data;
    const sql = neon(config.server.db.url);

    // Create table if not exists
    await sql`CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        source TEXT,
        subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`;

    // Insert subscription
    await sql`
      INSERT INTO subscriptions (email, source)
      VALUES (${payload.email}, ${payload.source ?? 'landing'})
    `;

    return res.status(200).json({ ok: true });
  } catch (error: unknown) {
    console.error('[subscribe] error:', error);

    // Handle unique constraint violation
    const dbError = error as { code?: string; message?: string };
    if (dbError?.code === '23505' || dbError?.message?.includes('unique')) {
      return res.status(409).json({ ok: false, error: 'already_subscribed' });
    }

    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});
