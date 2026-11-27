import { describe, expect, it } from 'bun:test';
import { serverRender } from './server-render';

const { default: PricingPage } = await import('@/pages/pricing');

// The server HTML of /pricing, cut into the Free, Pro and Ultimate cards.
const { body } = serverRender('/pricing', PricingPage, {});
const text = body.replace(/&#x27;/g, "'");
const proAt = text.indexOf('Pro — Everything in Free');
const ultimateAt = text.indexOf('Ultimate — Everything in Pro');
const free = text.slice(text.indexOf('Free Forever'), proAt);
const pro = text.slice(proAt, ultimateAt);
const ultimate = text.slice(ultimateAt, text.indexOf('Get Ultimate'));

describe('/pricing plan limits', () => {
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
