import { buildTime } from '@/adapters/external/core';
import { withApiLogtoOnly } from '@/adapters/atomi/next';

// Only a same-origin relative path (e.g. "/account-deletion") may be used as a post-sign-in
// return target — never an absolute or protocol-relative URL — to avoid open-redirect abuse.
function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return /^\/(?![/\\])/.test(value) ? value : undefined;
}

export default withApiLogtoOnly(buildTime, (req, res, { client: auth, baseUrl }) => {
  // When signing in with a same-origin `redirectBackUrl`, carry it through the Logto round-trip
  // via `postRedirectUri` (the SDK persists it in the sign-in cookie and the callback redirects
  // there) so flows like /account-deletion return the user to where they started. The origin is
  // taken from the trusted configured app base URL — NOT request headers — so a spoofed Host /
  // X-Forwarded-Host can neither poison the OAuth redirect_uri nor turn the return into an open
  // redirect. Every other route — and a plain sign-in without the param — is unchanged.
  if (req.query.action === 'sign-in') {
    const returnPath = safeReturnPath(req.query.redirectBackUrl);
    if (returnPath) {
      const origin = new URL(baseUrl).origin;
      auth.handleSignIn({
        redirectUri: `${origin}/api/logto/sign-in-callback`,
        postRedirectUri: `${origin}${returnPath}`,
      })(req, res);
      return;
    }
  }
  // Magic-link landing (app→web handoff): consume a Logto one-time token so the
  // user arrives authenticated without a login screen. The OTT rides the OIDC
  // authorization request as the `one_time_token` extra param; Logto's hosted
  // experience verifies it (single-use, short expiry). An expired/used token
  // degrades to the normal hosted sign-in page — the OIDC flow still completes
  // and the user still lands on `redirectBackUrl`. Same-origin guard + configured
  // baseUrl origin keep this closed to open-redirect abuse, same as sign-in above.
  if (req.query.action === 'ott-sign-in') {
    const ott = typeof req.query.ott === 'string' ? req.query.ott : undefined;
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const returnPath = safeReturnPath(req.query.redirectBackUrl) ?? '/billing';
    if (!ott) {
      res.redirect(`/api/logto/sign-in?redirectBackUrl=${encodeURIComponent(returnPath)}`);
      return;
    }
    const origin = new URL(baseUrl).origin;
    auth.handleSignIn({
      redirectUri: `${origin}/api/logto/sign-in-callback`,
      postRedirectUri: `${origin}${returnPath}`,
      extraParams: { one_time_token: ott },
      ...(email ? { loginHint: email } : {}),
    })(req, res);
    return;
  }
  auth.handleAuthRoutes({ fetchUserInfo: true })(req, res);
});
