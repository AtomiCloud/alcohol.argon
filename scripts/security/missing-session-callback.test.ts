import { expect, test } from 'bun:test';
import { unwrapSession, wrapSession } from '@logto/node';

test.skipIf(!process.env.ARGON_SECURITY_ORIGIN)(
  'MissingSessionCallback_CompletesSafelyWithoutAuthentication',
  async () => {
    const origin = new URL(process.env.ARGON_SECURITY_ORIGIN!);
    expect(['localhost', '127.0.0.1']).toContain(origin.hostname);
    const issuer = 'http://127.0.0.1:3301/oidc';
    let tokenRequests = 0;
    const fixture = Bun.serve({
      hostname: '127.0.0.1',
      port: 3301,
      fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === '/oidc/.well-known/openid-configuration') {
          return Response.json({
            issuer,
            authorization_endpoint: `${issuer}/auth`,
            token_endpoint: `${issuer}/token`,
            jwks_uri: `${issuer}/jwks`,
            response_types_supported: ['code'],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['RS256'],
          });
        }
        if (url.pathname === '/oidc/token') tokenRequests++;
        return new Response(null, { status: 404 });
      },
    });
    const suffix = process.env.ARGON_SECURITY_RUNTIME_OVERRIDES === '1' ? '-runtime' : '';
    const unusable = await wrapSession(
      { signInSession: JSON.stringify({ invalid: true }) },
      process.env.ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET! + suffix,
    );
    const observations: Record<string, unknown>[] = [];
    try {
      const signIn = await fetch(new URL('/api/logto/sign-in/?redirectBackUrl=%2Faccount-deletion', origin), {
        redirect: 'manual',
        signal: AbortSignal.timeout(5_000),
      });
      expect(signIn.status).toBe(307);
      const authorization = new URL(signIn.headers.get('location')!);
      const validCookie = signIn.headers
        .getSetCookie()
        .find(value => value.startsWith('logto_synthetic-app='))!
        .split(';')[0];
      const session = await unwrapSession(
        decodeURIComponent(validCookie.slice('logto_synthetic-app='.length)),
        process.env.ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET! + suffix,
      );
      expect(JSON.parse(session.signInSession!).state).toBe(authorization.searchParams.get('state'));
      expect(authorization.searchParams.get('state')).toBeTruthy();
      const wrongState = `${authorization.searchParams.get('state')}-wrong`;
      for (const [label, cookie, state, code, expectedStatus] of [
        ['missing-session', '', 'synthetic-invalid-state', 'synthetic-invalid-code', 400],
        ['tampered-session', 'logto_synthetic-app=tampered', 'synthetic-invalid-state', 'synthetic-invalid-code', 400],
        [
          'invalid-session-shape',
          `logto_synthetic-app=${encodeURIComponent(unusable)}`,
          'synthetic-invalid-state',
          'synthetic-invalid-code',
          400,
        ],
        ['fresh-valid-session-wrong-state', validCookie, wrongState, 'synthetic-invalid-code', 400],
        ['unrelated-sdk-missing-code', validCookie, authorization.searchParams.get('state')!, undefined, 500],
      ] as const) {
        const claimsBefore = await fetch(new URL('/api/auth/claims/', origin), {
          headers: { cookie },
          signal: AbortSignal.timeout(5_000),
        });
        expect(claimsBefore.status).toBe(200);
        const before = await claimsBefore.json();
        expect(before).toEqual(['ok', { __kind: 'unauthed', value: { isAuthed: false } }]);
        const tokenRequestsBefore = tokenRequests;
        const callback = new URL('/api/logto/sign-in-callback/', origin);
        callback.searchParams.set('state', state);
        if (code !== undefined) callback.searchParams.set('code', code);
        const started = performance.now();
        const response = await fetch(callback, {
          redirect: 'manual',
          headers: { cookie },
          signal: AbortSignal.timeout(5_000),
        });
        const body = await response.text();
        const elapsedMs = performance.now() - started;
        const claims = await fetch(new URL('/api/auth/claims/', origin), {
          headers: { cookie },
          signal: AbortSignal.timeout(5_000),
        });
        const after = await claims.json();
        observations.push({
          label,
          status: response.status,
          contentType: response.headers.get('content-type'),
          body,
          elapsedMs,
          location: response.headers.get('location'),
          setCookiePresent: response.headers.has('set-cookie'),
          claimsBefore: before,
          claimsAfter: after,
          tokenRequestsBefore,
          tokenRequestsAfter: tokenRequests,
        });
        expect(elapsedMs).toBeLessThan(5_000);
        expect(response.status).toBe(expectedStatus);
        expect(response.headers.get('location')).toBeNull();
        expect(response.headers.get('set-cookie')).toBeNull();
        if (expectedStatus === 400) {
          expect(response.headers.get('content-type')).toContain('application/problem+json');
          expect(body).toBe(
            '{"type":"about:blank","title":"Bad Request","status":400,"detail":"Sign-in could not be completed. Please start sign-in again."}',
          );
          expect(body).not.toContain('callback_uri_verification');
          expect(body).not.toContain('State mismatched');
        } else {
          expect(JSON.parse(body)).toHaveProperty('error', 'Internal Server Error');
        }
        expect(claims.status).toBe(200);
        expect(after).toEqual(['ok', { __kind: 'unauthed', value: { isAuthed: false } }]);
        expect(tokenRequests).toBe(tokenRequestsBefore);
        for (const [name, value] of Object.entries(process.env)) {
          if (name.startsWith('ATOMI_') && value) expect(body).not.toContain(value);
        }
      }
      expect(tokenRequests).toBe(0);
    } finally {
      await fixture.stop(true);
      if (process.env.ARGON_SECURITY_REPORT) {
        await Bun.write(
          `${process.env.ARGON_SECURITY_REPORT}.callbacks.json`,
          JSON.stringify(
            {
              observedAt: new Date().toISOString(),
              origin: origin.origin,
              tokenRequests,
              observations,
            },
            null,
            2,
          ),
        );
      }
    }
  },
  30_000,
);
