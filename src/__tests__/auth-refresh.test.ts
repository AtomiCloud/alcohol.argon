import { afterAll, expect, test } from 'bun:test';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { wrapSession } from '@logto/node';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authBuilder } from '@/lib/auth/core/server/adapter';
import { AuthChecker } from '@/lib/auth/core/checker';
import { ServerAuthStateRetriever } from '@/lib/auth/core/server/retriever';

// A loopback fake of Logto's OIDC endpoints with refresh-token rotation, as oidc-provider does it:
// a used refresh token is consumed, and presenting a consumed one revokes the whole grant.
const appId = 'test-app';
const zinc = 'https://api.zinc.alcohol.test';
const other = 'https://api.other.alcohol.test';
const resources = { 'alcohol-zinc': zinc, other };
const cookieSecret = 'test-cookie-secret-long-enough-for-session-encryption';
const { publicKey, privateKey } = await generateKeyPair('RS256');
const jwk = { ...(await exportJWK(publicKey)), kid: 'k', alg: 'RS256', use: 'sig' };
const logto = {
  live: new Set<string>(),
  consumed: new Set<string>(),
  revoked: false,
  uses: [] as string[],
  issued: 0,
};
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 0,
  async fetch(request) {
    const { origin, pathname } = new URL(request.url);
    const issuer = `${origin}/oidc`;
    if (pathname === '/oidc/.well-known/openid-configuration')
      return Response.json({
        issuer,
        authorization_endpoint: `${issuer}/auth`,
        token_endpoint: `${issuer}/token`,
        jwks_uri: `${issuer}/jwks`,
        userinfo_endpoint: `${issuer}/me`,
        end_session_endpoint: `${issuer}/session/end`,
        revocation_endpoint: `${issuer}/revoke`,
      });
    if (pathname === '/oidc/jwks') return Response.json({ keys: [jwk] });
    if (pathname === '/oidc/me') return Response.json({ sub: 'user-1' });
    if (pathname === '/oidc/token') {
      const body = new URLSearchParams(await request.text());
      const used = body.get('refresh_token') ?? '';
      logto.uses.push(used);
      await Bun.sleep(20); // so parallel refreshes overlap
      if (logto.revoked || !logto.live.has(used)) {
        if (logto.consumed.has(used)) logto.revoked = true;
        return Response.json({ error: 'invalid_grant' }, { status: 400 });
      }
      logto.live.delete(used);
      logto.consumed.add(used);
      const next = `R${++logto.issued}`;
      logto.live.add(next);
      const resource = body.get('resource');
      return Response.json({
        access_token: resource ? await sign(issuer, resource, '1h') : 'opaque',
        id_token: await sign(issuer, appId, '1h'),
        refresh_token: next,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile offline_access email',
      });
    }
    return new Response('not found', { status: 404 });
  },
});
afterAll(() => server.stop(true));

function sign(issuer: string, audience: string, exp: string | number) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256', kid: 'k' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject('user-1')
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(privateKey);
}

function client() {
  return authBuilder({
    endpoint: `http://127.0.0.1:${server.port}/`,
    appId,
    appSecret: 'test-app-secret',
    baseUrl: 'http://localhost:3000',
    cookieSecret,
    landscape: 'lapras',
    resourceTree: resources,
    scopes: ['openid', 'profile', 'offline_access', 'email'],
  }).client;
}

function nextApi(cookie?: string) {
  const req = {
    url: '/api/auth/tokens',
    headers: {},
    query: {},
    cookies: cookie ? { [`logto_${appId}`]: cookie } : {},
  };
  const res = { status: 0, body: undefined as unknown, setHeader: () => res, getHeader: () => undefined };
  return { req: req as unknown as NextApiRequest, res: res as unknown as NextApiResponse, sent: res };
}

test('An expired session refreshes once per token in a request and never reuses a rotated refresh token', async () => {
  // One hour after sign-in: ID token and access tokens expired; R0 is the current refresh token.
  const issuer = `http://127.0.0.1:${server.port}/oidc`;
  const past = Math.floor(Date.now() / 1000) - 60;
  logto.live.add('R0');
  const session = await wrapSession(
    {
      idToken: await sign(issuer, appId, past),
      refreshToken: 'R0',
      accessToken: JSON.stringify({
        '@': { token: 'old', scope: '', expiresAt: past },
        [`@${zinc}`]: { token: await sign(issuer, zinc, past), scope: '', expiresAt: past },
        [`@${other}`]: { token: await sign(issuer, other, past), scope: '', expiresAt: past },
      }),
    } as never,
    cookieSecret,
  );
  const auth = client();
  const { req, res, sent } = nextApi(session);

  // What /api/auth/tokens does: the Logto API route (fetches user info), then the retriever.
  let tokens: unknown;
  await auth.withLogtoApiRoute(
    async () => {
      const retriever = new ServerAuthStateRetriever(auth, new AuthChecker(), resources, req, res);
      tokens = await retriever.getTokenSet().serial();
    },
    { fetchUserInfo: true },
    async (_rq, _rs, error) => {
      tokens = ['thrown', String(error)];
    },
  )(req, res);

  expect(logto.revoked).toBe(false);
  // User info, then each API resource: three refreshes, each with the token the previous one issued.
  expect(logto.uses).toEqual(['R0', 'R1', 'R2']);
  expect(tokens).toMatchObject(['ok', { __kind: 'authed', value: { isAuthed: true } }]);
  expect(sent.status).toBe(0);
});

test('force_tokens while signed out answers unauthed instead of failing', async () => {
  const auth = client();
  const { req, res } = nextApi();
  const retriever = new ServerAuthStateRetriever(auth, new AuthChecker(), resources, req, res);

  expect(await retriever.forceTokenSet().serial()).toEqual(['ok', { __kind: 'unauthed', value: { isAuthed: false } }]);
});
