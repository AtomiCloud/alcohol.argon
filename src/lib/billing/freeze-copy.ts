import type { PlanRes } from '@/clients/alcohol/zinc/api';
import type { Tier } from '@/lib/billing/pricing';

// zinc's option-B freeze rules: a one-time starter allowance equal to the cap,
// then 1 per perfect Sunday–Saturday week, up to the cap.
export const FREEZE_POLICY_V2 = 'starter-weekly-v1';

// A plan from GET Subscription/plans. freezePolicy is optional: older servers
// leave it out, and a newer server may send a policy this build does not know.
export type CatalogPlan = PlanRes & { freezePolicy?: string | null };

export type FreezeCopy = { label: string; tooltip: string };

const PROTECTS = 'A freeze automatically protects all your habits on a day you miss.';

const freezes = (n: number) => `${n} ${n === 1 ? 'freeze' : 'freezes'}`;

const planFor = (plans: CatalogPlan[] | null, tier: Tier) => plans?.find(p => p.key === tier);

export const isV2FreezePolicy = (plans: CatalogPlan[] | null): plans is CatalogPlan[] =>
  plans != null && plans.length > 0 && plans.every(p => p.freezePolicy === FREEZE_POLICY_V2);

/**
 * The freeze line on a plan card, from the live catalog. Only a known policy
 * makes starting or earning promises; without one the card states the cap
 * alone, and without a catalog it names no number at all.
 */
export function planFreezeCopy(plans: CatalogPlan[] | null, tier: Tier): FreezeCopy | null {
  const plan = planFor(plans, tier);
  if (plan == null) return tier === 'free' ? null : { label: 'Automatic freeze protection', tooltip: PROTECTS };

  const cap = plan.freezeBase;
  if (plan.freezePolicy === FREEZE_POLICY_V2) {
    if (cap <= 0) return { label: 'No freezes', tooltip: 'Freezes come with Pro and Ultimate.' };
    const pro = planFor(plans, 'pro')?.freezeBase ?? 0;
    const ultimate = planFor(plans, 'ultimate')?.freezeBase ?? 0;
    const upgrade = ultimate > pro && pro > 0 ? ` First Pro→Ultimate upgrade adds ${ultimate - pro}.` : '';
    return {
      label: `Start with ${freezes(cap)} · bank up to ${cap}`,
      tooltip: `${PROTECTS} Once per account. Earn 1 per perfect week.${upgrade}`,
    };
  }
  if (cap <= 0) return null;
  return { label: `Up to ${freezes(cap)}`, tooltip: PROTECTS };
}
