import { useEffect, useMemo, useState } from 'react';
import { useTokens } from '@/lib/auth/providers';
import type { ExtendedClaims } from '@/lib/auth/core/extended-claims';
import type { TokenSet } from '@/lib/auth/core/types';

function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split('.')[1] ?? '';
    // Base64url decode
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : b64.length % 4 === 1 ? '===' : '';
    let json: string;
    if (typeof atob === 'function') {
      json = atob(b64 + pad);
    } else {
      // Node/SSR fallback
      // eslint-disable-next-line no-undef
      json = Buffer.from(b64 + pad, 'base64').toString('utf-8');
    }
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function useAuthedClaims(): ExtendedClaims | null {
  const tokensResult = useTokens();

  return useMemo(() => {
    const [resultType, content] = tokensResult;
    if (resultType !== 'ok') return null;

    const [hasData, authStateRaw] = content;
    if (!hasData || !authStateRaw) return null;

    const authState = authStateRaw as unknown as { __kind: string; value: { data: TokenSet } };
    if (authState.__kind !== 'authed') return null;

    // Decode the alcohol-zinc access token (not the ID token)
    const accessToken = authState.value.data.accessTokens['alcohol-zinc'];
    if (!accessToken) return null;
    const payload = decodeJwtPayload<ExtendedClaims>(accessToken);
    return payload ?? null;
  }, [tokensResult]);
}

export function useUserId(): string | undefined {
  const claims = useAuthedClaims();
  const [userId, setUserId] = useState(claims?.sub);
  useEffect(() => {
    setUserId(claims?.sub);
  }, [claims, claims?.sub]);
  return userId;
}

export function useHasPaymentConsent(): boolean {
  const claims = useAuthedClaims();
  const initial = claims?.has_payment_consent === true || claims?.has_payment_consent === 'true';
  const [hasPaymentConsent, setHasPaymentConsent] = useState(initial);
  useEffect(() => {
    setHasPaymentConsent(claims?.has_payment_consent === true || claims?.has_payment_consent === 'true');
  }, [claims, claims?.has_payment_consent]);
  return hasPaymentConsent;
}
