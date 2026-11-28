import { describe, expect, it } from 'bun:test';
import { renderToString } from 'react-dom/server';
import type { HabitOverviewHabitRes, ProtectionBalanceRes } from '@/clients/alcohol/zinc/api';
import { afterFailedRefresh, FreezeBalanceView } from '@/components/app/FreezeBalanceStat';
import type { HabitPageData } from '@/lib/habit-page-data';
import type { ResultSerial } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { serverRender } from './server-render';

const { default: AppPage } = await import('@/pages/app');

const USER = '11111111-1111-1111-1111-111111111111';

// Two habits due every day, both frozen on the same Monday: zinc spent one freeze for that day.
const habit = (id: string, name: string): HabitOverviewHabitRes => ({
  id,
  name,
  days: [true, true, true, true, true, true, true],
  timezone: 'UTC',
  stake: { amount: 0, currency: 'USD' },
  enabled: true,
  status: {
    currentStreak: 2,
    maxStreak: 4,
    isCompleteToday: false,
    week: { monday: 'freeze', tuesday: 'succeeded' },
  },
  timeLeftToEodMinutes: 300,
  version: { id: `${id}-v1`, version: 1, isActive: true },
  sortOrder: 0,
  canUndo: false,
});

const initial: ResultSerial<HabitPageData, Problem> = [
  'ok',
  {
    userId: USER,
    config: { principal: { id: 'c1', timezone: 'UTC' } } as HabitPageData['config'],
    habits: {
      habits: [habit('h1', 'Morning run'), habit('h2', 'Read 10 pages')],
      totalDebt: '0',
      usedSkip: 1,
      totalSkip: 5,
    },
  },
];

const problem = { type: 'urn:problem:unavailable', title: 'Unavailable', status: 503 } as unknown as Problem;

// The server HTML of /app, with React's text separators removed so "1/3" reads as one string.
function renderApp(protection: ResultSerial<ProtectionBalanceRes, Problem>) {
  const html = serverRender('/app', AppPage, { initial, protection }).body.replace(/<!-- -->/g, '');
  const freezeAt = html.indexOf('To Donate');
  const skipsAt = html.indexOf('Skips Left');
  return { html, freezes: html.slice(freezeAt, skipsAt), skips: html.slice(skipsAt, skipsAt + 600) };
}

describe('/app freeze balance', () => {
  it("FreezeBalance_UsesServerOneOfThree_NotFiveMinusWeekCount: shows zinc's balance and cap", () => {
    const { freezes } = renderApp(['ok', { userId: USER, balance: 1, cap: 3 }]);
    expect(freezes).toContain('Freezes available');
    expect(freezes).toContain('>1/3<');
    expect(freezes).not.toMatch(/\/5</);
  });

  it('FreezeBalance_HasNoMonthlyRefillLabel: the freeze stat has no monthly label, skips keep theirs', () => {
    const { freezes, skips } = renderApp(['ok', { userId: USER, balance: 1, cap: 3 }]);
    expect(freezes).not.toMatch(/month/i);
    expect(skips).toContain('>4/5<');
    expect(skips).toContain('this month');
  });

  it('takes the cap from the server, not from a fixed plan size', () => {
    expect(renderApp(['ok', { userId: USER, balance: 2, cap: 4 }]).freezes).toContain('>2/4<');
  });

  it('says No freezes when the plan has none, never 0/0', () => {
    const { freezes } = renderApp(['ok', { userId: USER, balance: 0, cap: 0 }]);
    expect(freezes).toContain('No freezes');
    expect(freezes).not.toContain('0/0');
  });

  it('shows Balance unavailable with a retry when the balance fails, and still lists the habits', () => {
    const { html, freezes } = renderApp(['err', problem]);
    expect(freezes).toContain('Balance unavailable');
    expect(freezes).toContain('>Retry<');
    expect(freezes).not.toMatch(/\d\/\d/);
    expect(html).toContain('Morning run');
    expect(html).toContain('Read 10 pages');
  });
});

describe('freeze balance refresh', () => {
  it('keeps the last balance but marks it not up to date when a refresh fails', () => {
    const state = afterFailedRefresh({ kind: 'ok', balance: 1, cap: 3, stale: false });
    expect(state).toEqual({ kind: 'ok', balance: 1, cap: 3, stale: true });
    const html = renderToString(<FreezeBalanceView state={state} onRetry={() => {}} />).replace(/<!-- -->/g, '');
    expect(html).toContain('>1/3<');
    expect(html).toContain('Not up to date');
  });

  it('never turns a failure into a number', () => {
    expect(afterFailedRefresh({ kind: 'loading' })).toEqual({ kind: 'error' });
    expect(afterFailedRefresh({ kind: 'error' })).toEqual({ kind: 'error' });
  });
});
