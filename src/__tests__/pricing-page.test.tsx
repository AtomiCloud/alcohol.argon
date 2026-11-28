import { describe, expect, it } from 'bun:test';
import type { CatalogPlan } from '@/lib/billing/freeze-copy';
import type { ResultSerial } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { serverRender } from './server-render';

const { default: PricingPage } = await import('@/pages/pricing');

const plan = (key: string, freezeBase: number, freezePolicy?: string): CatalogPlan => ({
  key,
  priceCents: 0,
  currency: 'USD',
  habitsMax: null,
  habitsUnlimited: false,
  skipsMonthly: 3,
  vacationWindowsYearly: 0,
  vacationMaxDays: 0,
  freezeBase,
  ...(freezePolicy === undefined ? {} : { freezePolicy }),
});

const catalog = (
  free: number,
  pro: number,
  ultimate: number,
  policy?: string,
): ResultSerial<CatalogPlan[], Problem> => [
  'ok',
  [plan('free', free, policy), plan('pro', pro, policy), plan('ultimate', ultimate, policy)],
];

const V2 = 'starter-weekly-v1';

// The server HTML of /pricing, cut into the Free, Pro and Ultimate cards and what follows them.
function renderPricing(plans: ResultSerial<CatalogPlan[], Problem>) {
  const text = serverRender('/pricing', PricingPage, { plans })
    .body.replace(/&#x27;/g, "'")
    .replace(/<!-- -->/g, '');
  const proAt = text.indexOf('Pro — Everything in Free');
  const ultimateAt = text.indexOf('Ultimate — Everything in Pro');
  const ultimateEnd = text.indexOf('Get Ultimate');
  return {
    text,
    free: text.slice(text.indexOf('Free Forever'), proAt),
    pro: text.slice(proAt, ultimateAt),
    ultimate: text.slice(ultimateAt, ultimateEnd),
    below: text.slice(ultimateEnd),
  };
}

describe('/pricing plan limits', () => {
  const { text, free, pro, ultimate } = renderPricing(catalog(0, 3, 5, V2));

  it('finds all three plan cards', () => {
    expect(free.length).toBeGreaterThan(0);
    expect(pro.length).toBeGreaterThan(0);
    expect(ultimate.length).toBeGreaterThan(0);
  });

  it('lists 3 / 5 / 10 skips a month', () => {
    expect(free).toContain('>3 skips a month<');
    expect(pro).toContain('>5 skips a month<');
    expect(ultimate).toContain('>10 skips a month<');
    expect(text).not.toContain('Monthly skips');
  });

  it('lists 2 / 5 vacations a year with the longest vacation in the tooltip, and none on Free', () => {
    expect(free).not.toMatch(/vacation/i);
    expect(pro).toContain('>2 vacations a year<');
    expect(pro).toContain('Up to 14 days each.');
    expect(ultimate).toContain('>5 vacations a year<');
    expect(ultimate).toContain('Up to 30 days each.');
    expect(text).not.toContain('Vacation mode');
  });
});

describe('/pricing freezes', () => {
  it('PlanCopy_V2StatesOnceOnlyAndOneWeeklyReward_NoStreakBonus', () => {
    const { pro, ultimate, below } = renderPricing(catalog(0, 3, 5, V2));
    expect(pro).toContain('>Start with 3 freezes · bank up to 3<');
    expect(ultimate).toContain('>Start with 5 freezes · bank up to 5<');
    for (const card of [pro, ultimate]) {
      expect(card).toContain('Once per account. Earn 1 per perfect week. First Pro→Ultimate upgrade adds 2.');
      expect(card).not.toMatch(/Earn (more )?freezes|7-day|per streak|per habit|freezes? (a|per) month/i);
    }
    expect(below).toContain('How do freezes work?');
    expect(below).toContain('Pro starts with 3 and Ultimate with 5. You get them once per account');
    expect(below).toContain(
      'Earn 1 freeze for each perfect week, Sunday to Saturday, starting with your first full week.',
    );
    expect(below).toContain('Vacation days are excused. Skips, frozen days and misses do not count');
    expect(below).toContain('at least 1 completion');
    expect(below).toContain('Unused freezes carry over');
    expect(below).toContain('freezes above the new limit are removed for good');
  });

  it('FreePlan_DoesNotPromiseEarningOrStarterGrant', () => {
    const { free, pro } = renderPricing(catalog(0, 3, 5, V2));
    expect(free).toContain('>No freezes<');
    expect(free).not.toMatch(/Start with|Earn|perfect week/);
    expect(pro).toContain('Start with 3 freezes');
  });

  it('takes the numbers from the catalog', () => {
    const { pro, ultimate, below } = renderPricing(catalog(0, 4, 5, V2));
    expect(pro).toContain('>Start with 4 freezes · bank up to 4<');
    expect(ultimate).toContain('First Pro→Ultimate upgrade adds 1.');
    expect(below).toContain('Pro starts with 4 and Ultimate with 5.');
  });

  it.each([
    ['no policy', undefined],
    ['an unknown policy', 'starter-weekly-v9'],
  ])('UnknownOrMissingPolicy_UsesNeutralCapCopy: %s', (_, policy) => {
    const { text, free, pro, ultimate } = renderPricing(catalog(0, 14, 30, policy));
    expect(pro).toContain('>Up to 14 freezes<');
    expect(ultimate).toContain('>Up to 30 freezes<');
    expect(free).not.toMatch(/freeze/i);
    expect(text).not.toMatch(/Start with|perfect week|Once per account|How do freezes work/);
  });

  it('names no freeze numbers when the catalog fails', () => {
    const { text, free, pro, ultimate } = renderPricing([
      'err',
      { type: 'urn:problem:unavailable', title: 'Unavailable', status: 503 } as unknown as Problem,
    ]);
    expect(pro).toContain('>Automatic freeze protection<');
    expect(ultimate).toContain('>Automatic freeze protection<');
    expect(free).not.toMatch(/freeze/i);
    expect(text).not.toMatch(/\d+ freezes|Start with|perfect week/);
  });

  it('shows no account balance on the public page', () => {
    expect(renderPricing(catalog(0, 3, 5, V2)).text).not.toContain('Freezes available');
  });
});
