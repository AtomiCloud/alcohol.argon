import type { Problem } from '@/lib/problem/core';

export type BillingErrorKind =
  | 'no_payment_consent'
  | 'subscription_charge_failed'
  | 'renewal_in_progress'
  | 'already_subscribed'
  | 'invalid_subscription_tier'
  | 'no_active_subscription'
  | 'unknown';

// zinc problems pass through the swagger adapter verbatim; the machine code is
// the last segment of the RFC 7807 `type` URI
// (e.g. https://api.zinc.../docs/.../v1/no_payment_consent).
export function zincErrorId(problem: Problem): string | null {
  if (typeof problem.type !== 'string' || problem.type.length === 0) return null;
  return problem.type.split('/').filter(Boolean).pop() ?? null;
}

const KNOWN_IDS: ReadonlySet<string> = new Set([
  'no_payment_consent',
  'subscription_charge_failed',
  'renewal_in_progress',
  'already_subscribed',
  'invalid_subscription_tier',
  'no_active_subscription',
]);

export function classifyBillingError(problem: Problem): BillingErrorKind {
  const id = zincErrorId(problem);
  if (id && KNOWN_IDS.has(id)) return id as BillingErrorKind;

  // Fallback on HTTP status when the type URI is unavailable or unrecognized.
  switch (problem.status) {
    case 412:
      return 'no_payment_consent';
    case 402:
      return 'subscription_charge_failed';
    case 409:
      return 'renewal_in_progress';
    default:
      return 'unknown';
  }
}

// subscription_charge_failed carries the Airwallex intent status as a
// Problem extension field.
export function chargeFailureIntentStatus(problem: Problem): string | null {
  const status = problem.intentStatus;
  return typeof status === 'string' && status.length > 0 ? status : null;
}
