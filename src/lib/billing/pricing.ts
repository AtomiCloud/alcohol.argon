export type PaidTier = 'pro' | 'ultimate';
export type Tier = 'free' | PaidTier;

export interface TierPricing {
  label: string;
  /** Launch price actually charged, in USD cents */
  launchCents: number;
  /** Struck-through original price, in USD cents */
  originalCents: number;
}

// Monthly billing only — zinc has no annual billing. Keep in sync with
// alcohol.zinc App/Config/settings.yaml (Subscription.Tiers PriceCents).
export const TIER_PRICING: Record<PaidTier, TierPricing> = {
  pro: { label: 'Pro', launchCents: 499, originalCents: 999 },
  ultimate: { label: 'Ultimate', launchCents: 799, originalCents: 1499 },
};

// Rank ordering decides upgrade (immediate charge, period resets) vs
// downgrade (applies at period end) messaging.
export const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, ultimate: 2 };

export function parsePaidTier(value: unknown): PaidTier | null {
  return value === 'pro' || value === 'ultimate' ? value : null;
}

export function parseTier(value: unknown): Tier | null {
  return value === 'free' ? 'free' : parsePaidTier(value);
}

export function formatUsdCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function tierLabel(tier: string | null | undefined): string {
  const parsed = parseTier(tier);
  if (parsed === 'free' || parsed == null) return 'Free';
  return TIER_PRICING[parsed].label;
}
