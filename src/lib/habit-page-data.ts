import type { ConfigurationRes, HabitOverviewResponse } from '@/clients/alcohol/zinc/api';
import { Ok, Res, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

export type HabitPageData = {
  habits: HabitOverviewResponse;
  config: ConfigurationRes;
  userId: string;
};

// The zinc calls the habit page needs, shared by the server render and the client refresh.
export interface HabitPageApi {
  vHabitOverviewList: (params: {
    userId: string;
    version: string;
    Limit?: number;
    Skip?: number;
  }) => Promise<Result<HabitOverviewResponse, Problem>>;
  vConfigurationMeList: (params: { version: string }) => Promise<Result<ConfigurationRes, Problem>>;
}

// zinc's largest page; without a limit it returns only 20 habits.
export const OVERVIEW_PAGE_SIZE = 100;

// Loads the overview from `skip` on, a page at a time, until a page is short. Habits keep page
// order and a repeated id is dropped; the totals are per user, so they come from the first page.
// Any failed page fails the whole load, so the page never shows a partial list.
function loadOverview(
  api: HabitPageApi,
  userId: string,
  skip: number,
  merged: HabitOverviewResponse | null,
  seen: Set<string>,
): Result<HabitOverviewResponse, Problem> {
  return Res.fromAsync(
    api.vHabitOverviewList({ userId, version: '1.0', Limit: OVERVIEW_PAGE_SIZE, Skip: skip }),
  ).andThen(page => {
    const pageHabits = page.habits ?? [];
    const fresh = pageHabits.filter(h => !h.id || !seen.has(h.id));
    for (const h of fresh) if (h.id) seen.add(h.id);
    const next = { ...(merged ?? page), habits: [...(merged?.habits ?? []), ...fresh] };
    // A page that adds nothing new ends the load, so a server that ignores Skip cannot loop.
    if (pageHabits.length < OVERVIEW_PAGE_SIZE || fresh.length === 0) return Ok<HabitOverviewResponse, Problem>(next);
    return loadOverview(api, userId, skip + OVERVIEW_PAGE_SIZE, next, seen);
  });
}

export async function fetchHabitPageData(api: HabitPageApi, userId: string): Promise<Result<HabitPageData, Problem>> {
  const habitsResult = loadOverview(api, userId, 0, null, new Set());
  const configResult = await api.vConfigurationMeList({ version: '1.0' });

  return habitsResult.andThen((habits: HabitOverviewResponse) =>
    configResult.map((config: ConfigurationRes) => ({
      habits,
      config,
      userId,
    })),
  );
}
