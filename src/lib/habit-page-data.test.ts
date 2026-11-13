import { describe, expect, it } from 'bun:test';
import type { ConfigurationRes, HabitOverviewHabitRes, HabitOverviewResponse } from '@/clients/alcohol/zinc/api';
import { fetchHabitPageData, type HabitPageApi } from '@/lib/habit-page-data';
import { Err, Ok, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

const USER = 'user-1';
const habit = (n: number) => ({ id: `h${n}`, name: `Habit ${n}` }) as HabitOverviewHabitRes;
const habits = (count: number) => Array.from({ length: count }, (_, i) => habit(i + 1));
const config = { principal: { id: 'cfg-1' }, charity: { id: 'charity-1' } } as unknown as ConfigurationRes;
const problem = { type: 'urn:test:down', title: 'Down', status: 503 } as unknown as Problem;

type OverviewParams = Parameters<HabitPageApi['vHabitOverviewList']>[0];

// Behaves like zinc's overview: honours Limit and Skip, and returns 20 habits when no limit is
// sent. Totals are per user. `page` can replace what a given call returns.
function fakeApi(all: HabitOverviewHabitRes[], page?: (call: number, params: OverviewParams) => unknown) {
  const calls: OverviewParams[] = [];
  const api: HabitPageApi = {
    vHabitOverviewList: async params => {
      calls.push(params);
      const override = page?.(calls.length, params);
      if (override !== undefined) return override as Result<HabitOverviewResponse, Problem>;
      const skip = params.Skip ?? 0;
      return Ok({
        habits: all.slice(skip, skip + (params.Limit ?? 20)),
        totalDebt: '12.50',
        usedSkip: 2,
        totalSkip: 3,
      });
    },
    vConfigurationMeList: async () => Ok(config),
  };
  return { api, calls };
}

const ids = (r: HabitOverviewResponse) => (r.habits ?? []).map(h => h.id);

describe('fetchHabitPageData', () => {
  it('loads all 25 habits, not the 20 zinc returns by default', async () => {
    const { api } = fakeApi(habits(25));

    const data = await (await fetchHabitPageData(api, USER)).unwrap();

    expect(ids(data.habits)).toEqual(habits(25).map(h => h.id));
    expect(data.config).toEqual(config);
    expect(data.userId).toBe(USER);
  });

  it('pages 100 at a time and keeps the first page totals', async () => {
    const { api, calls } = fakeApi(habits(105), call =>
      call === 2 ? Ok({ habits: habits(105).slice(100), totalDebt: '0', usedSkip: 0, totalSkip: 0 }) : undefined,
    );

    const data = await (await fetchHabitPageData(api, USER)).unwrap();

    expect(calls.map(c => ({ Limit: c.Limit, Skip: c.Skip }))).toEqual([
      { Limit: 100, Skip: 0 },
      { Limit: 100, Skip: 100 },
    ]);
    expect(ids(data.habits)).toEqual(habits(105).map(h => h.id));
    expect(data.habits).toMatchObject({ totalDebt: '12.50', usedSkip: 2, totalSkip: 3 });
  });

  it('makes one overview call for a user with 3 habits', async () => {
    const { api, calls } = fakeApi(habits(3));

    const data = await (await fetchHabitPageData(api, USER)).unwrap();

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ userId: USER, Limit: 100, Skip: 0 });
    expect(ids(data.habits)).toEqual(['h1', 'h2', 'h3']);
  });

  it('asks once more after exactly 100 habits, and stops on the empty page', async () => {
    const { api, calls } = fakeApi(habits(100));

    const data = await (await fetchHabitPageData(api, USER)).unwrap();

    expect(calls.map(c => c.Skip)).toEqual([0, 100]);
    expect(data.habits.habits).toHaveLength(100);
  });

  it('fails with the problem when the second page fails, instead of showing 100 habits', async () => {
    const { api } = fakeApi(habits(150), call => (call === 2 ? Err(problem) : undefined));

    const result = await fetchHabitPageData(api, USER);

    expect(await result.isErr()).toBe(true);
    expect(await result.unwrapErr()).toBe(problem);
  });

  it('drops a habit the second page repeats from the first', async () => {
    const all = habits(103);
    const { api } = fakeApi(all, call =>
      call === 2 ? Ok({ habits: [habit(100), ...all.slice(100)], usedSkip: 2, totalSkip: 3 }) : undefined,
    );

    const data = await (await fetchHabitPageData(api, USER)).unwrap();

    expect(ids(data.habits)).toEqual(all.map(h => h.id));
  });

  it('stops when a page adds no new habit, so a server that ignores Skip cannot loop', async () => {
    const all = habits(100);
    const { api, calls } = fakeApi(all, () => Ok({ habits: all, usedSkip: 0, totalSkip: 3 }));

    const data = await (await fetchHabitPageData(api, USER)).unwrap();

    expect(calls).toHaveLength(2);
    expect(data.habits.habits).toHaveLength(100);
  });
});
