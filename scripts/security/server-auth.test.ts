import { expect, test } from 'bun:test';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { unwrapSession } from '@logto/node';

const origin = process.env.ARGON_SECURITY_ORIGIN;

test.skipIf(!origin)(
  'Server runtime credentials support local OIDC login/session/logout and reject tampered cookies',
  async () => {
    const base = new URL(origin!);
    expect(['localhost', '127.0.0.1']).toContain(base.hostname);
    const issuer = 'http://127.0.0.1:3301/oidc';
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'synthetic', alg: 'RS256', use: 'sig' };
    let nonce = '';
    let authenticatedExchanges = 0;
    const fixture = Bun.serve({
      hostname: '127.0.0.1',
      port: 3301,
      async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === '/oidc/.well-known/openid-configuration') {
          return Response.json({
            issuer,
            authorization_endpoint: `${issuer}/auth`,
            token_endpoint: `${issuer}/token`,
            jwks_uri: `${issuer}/jwks`,
            userinfo_endpoint: `${issuer}/me`,
            end_session_endpoint: `${issuer}/session/end`,
            revocation_endpoint: `${issuer}/revoke`,
            response_types_supported: ['code'],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['RS256'],
          });
        }
        if (url.pathname === '/oidc/auth') {
          nonce = url.searchParams.get('nonce')!;
          const callback = new URL(url.searchParams.get('redirect_uri')!);
          if (callback.origin !== base.origin) return new Response('Invalid callback', { status: 400 });
          callback.searchParams.set('code', 'synthetic-code');
          callback.searchParams.set('state', url.searchParams.get('state')!);
          return Response.redirect(callback);
        }
        if (url.pathname === '/oidc/jwks') return Response.json({ keys: [jwk] });
        if (url.pathname === '/oidc/token') {
          const suffix = process.env.ARGON_SECURITY_RUNTIME_OVERRIDES === '1' ? '-runtime' : '';
          const expected = `Basic ${Buffer.from(`${process.env.ATOMI_SERVER__AUTH__LOGTO__APP__ID}:${process.env.ATOMI_SERVER__AUTH__LOGTO__APP__SECRET}${suffix}`).toString('base64')}`;
          if (request.headers.get('authorization') !== expected)
            return Response.json({ error: 'invalid_client' }, { status: 401 });
          authenticatedExchanges++;
          const idToken = await new SignJWT({
            nonce,
            username: 'synthetic',
            email: 'synthetic@example.invalid',
            email_verified: true,
          })
            .setProtectedHeader({ alg: 'RS256', kid: 'synthetic' })
            .setIssuer(issuer)
            .setAudience('synthetic-app')
            .setSubject('synthetic-user')
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(privateKey);
          const accessToken = await new SignJWT({ alcohol_zinc: 'true', configuration_id: 'synthetic-config' })
            .setProtectedHeader({ alg: 'RS256', kid: 'synthetic' })
            .setIssuer(issuer)
            .setSubject('synthetic-user')
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(privateKey);
          return Response.json({
            id_token: idToken,
            access_token: accessToken,
            refresh_token: 'synthetic-refresh',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile email offline_access',
          });
        }
        if (url.pathname === '/oidc/me')
          return Response.json({
            sub: 'synthetic-user',
            username: 'synthetic',
            email: 'synthetic@example.invalid',
            email_verified: true,
          });
        if (url.pathname === '/oidc/revoke') return new Response(null, { status: 200 });
        return new Response(null, { status: 404 });
      },
    });
    const jar = new Map<string, string>();
    const get = async (path: string) => {
      const url = new URL(path, base);
      expect([base.origin, 'http://127.0.0.1:3301']).toContain(url.origin);
      if (url.origin === base.origin && url.pathname.startsWith('/api/') && !url.pathname.endsWith('/'))
        url.pathname += '/';
      const response = await fetch(url, {
        redirect: 'manual',
        headers: url.origin === base.origin ? { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } : {},
      });
      for (const value of response.headers.getSetCookie()) {
        const [pair] = value.split(';');
        const index = pair.indexOf('=');
        jar.set(pair.slice(0, index), pair.slice(index + 1));
      }
      return response;
    };
    try {
      expect(await (await get('/api/auth/claims')).json()).toEqual([
        'ok',
        { __kind: 'unauthed', value: { isAuthed: false } },
      ]);
      const signIn = await get('/api/logto/sign-in?redirectBackUrl=/account-deletion');
      expect(signIn.status).toBe(307);
      expect(signIn.headers.get('set-cookie')).toContain('HttpOnly');
      const authorize = await get(signIn.headers.get('location')!);
      const callback = await get(authorize.headers.get('location')!);
      expect(callback.status).toBe(307);
      expect(callback.headers.get('location')).toBe(`${base.origin}/account-deletion`);
      expect(authenticatedExchanges).toBeGreaterThan(0);
      const claims = await (await get('/api/auth/claims')).json();
      expect(claims[1].value.isAuthed).toBe(true);
      expect(claims[1].value.data.sub).toBe('synthetic-user');
      const tokens = await (await get('/api/auth/tokens')).json();
      expect(tokens[1].value.isAuthed).toBe(true);
      expect(tokens[1].value.data.accessTokens['alcohol-zinc']).toBeString();
      const cookieName = 'logto_synthetic-app';
      const validCookie = jar.get(cookieName)!;
      const suffix = process.env.ARGON_SECURITY_RUNTIME_OVERRIDES === '1' ? '-runtime' : '';
      const cookieSecret = process.env.ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET!;
      expect((await unwrapSession(decodeURIComponent(validCookie), cookieSecret + suffix)).idToken).toBeString();
      if (suffix) expect(await unwrapSession(decodeURIComponent(validCookie), cookieSecret)).toEqual({});
      jar.set(cookieName, 'tampered');
      expect(await (await get('/api/auth/claims')).json()).toEqual([
        'ok',
        { __kind: 'unauthed', value: { isAuthed: false } },
      ]);
      jar.set(cookieName, validCookie);
      const signOut = await get('/api/logto/sign-out');
      expect(signOut.status).toBe(307);
      expect(await (await get('/api/auth/claims')).json()).toEqual([
        'ok',
        { __kind: 'unauthed', value: { isAuthed: false } },
      ]);
    } finally {
      await fixture.stop(true);
    }
  },
  120_000,
);
