import { useEffect, useMemo, useState } from 'react';
import { useClaims } from '@/lib/auth/providers';
import type { ExtendedClaims } from '@/lib/auth/core/extended-claims';

function useAuthedClaims(): ExtendedClaims | null {
  const claimsResult = useClaims();

  return useMemo(() => {
    const [resultType, content] = claimsResult;
    if (resultType !== 'ok') return null;

    const [hasData, authStateRaw] = content;
    if (!hasData || !authStateRaw) return null;

    const authState = authStateRaw as unknown as { __kind: string; value: { data: ExtendedClaims } };
    if (authState.__kind !== 'authed') return null;

    return authState.value.data ?? null;
  }, [claimsResult]);
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
  const [hasPaymentConsent, setHasPaymentConsent] = useState(claims?.has_payment_consent === 'true');
  useEffect(() => {
    setHasPaymentConsent(claims?.has_payment_consent === 'true');
  }, [claims, claims?.has_payment_consent]);
  return hasPaymentConsent;
}
