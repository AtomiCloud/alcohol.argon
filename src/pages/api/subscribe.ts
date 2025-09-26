import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const SubscribeSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  // Accept any simple map of strings for UTM data (keys and values as strings)
  utm: z.record(z.string(), z.string()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const parsed = SubscribeSchema.safeParse(data);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'invalid_email' });
    }

    const payload = parsed.data;

    // Stub sink: log locally for now. Replace with your endpoint later.
    // Example: await fetch(process.env.SUBSCRIBE_WEBHOOK_URL!, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    console.info('[subscribe] waitlist', {
      email: payload.email,
      source: payload.source ?? 'landing',
      utm: payload.utm ?? null,
      ts: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
}
