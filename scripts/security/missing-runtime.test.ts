import { expect, test } from 'bun:test';

test.skipIf(process.env.ARGON_SECURITY_MISSING_RUNTIME !== '1')(
  'Missing runtime auth bindings fail closed instead of using build credentials',
  async () => {
    const origin = new URL(process.env.ARGON_SECURITY_ORIGIN!);
    expect(['localhost', '127.0.0.1']).toContain(origin.hostname);
    for (const path of ['/', '/api/auth/claims/', '/api/logto/sign-in/']) {
      const response = await fetch(new URL(path, origin), { redirect: 'manual' });
      expect(response.status).toBe(500);
      const body = await response.text();
      for (const name of ['ATOMI_SERVER__AUTH__LOGTO__APP__SECRET', 'ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET']) {
        expect(body).not.toContain(process.env[name]!);
      }
    }
    expect((await fetch(new URL('/api/manifest/', origin))).status).toBe(200);
  },
  120_000,
);
