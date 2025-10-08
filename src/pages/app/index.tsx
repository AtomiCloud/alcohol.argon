import { useEffect, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useClientConfig, useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConfigurationRes, HabitOverviewHabitRes } from '@/clients/alcohol/zinc/api';
import ConfettiExplosion from 'react-confetti-explosion';
import Toast from '@/components/Toast';
import HabitCard from '@/components/app/HabitCard';
import { FreeContentManager } from '@/lib/content/components/FreeContentManager';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useContent } from '@/lib/content/providers/useContent';
import { Res, type Result, type ResultSerial } from '@/lib/monads/result';
import { Plus, Flame, CalendarX, Sparkles, Palmtree, Snowflake, MinusCircle } from 'lucide-react';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import type { Problem } from '@/lib/problem/core';

type HabitPageData = {
  habits: HabitOverviewHabitRes[];
  config: ConfigurationRes;
  totalDebt: string | null;
};
type AppPageProps = { initial: ResultSerial<HabitPageData, Problem> };

// HabitDraft + defaults consolidated under models

export default function AppPage({ initial }: AppPageProps) {
  const api = useSwaggerClients();
  const clientConfig = useClientConfig();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();

  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();
  const [optimisticCompletions, setOptimisticCompletions] = useState<Set<string>>(new Set());

  // Errors are reported via ProblemReporter; no local error state rendered
  const [contentResult, setContentResult] = useState<Result<HabitPageData, Problem>>(() =>
    Res.fromSerial<HabitPageData, Problem>(initial),
  );
  const data = useContent(contentResult, {
    defaultContent: initial,
    loader,
    empty,
    notFound: 'No habits yet',
    // Longer delay to avoid brief loader flashes during quick refreshes
    loaderDelay: 900,
  });

  // Merge server data with optimistic completions
  const serverHabits = data?.habits ?? [];
  const habits = serverHabits.map(habit => {
    if (habit.id && optimisticCompletions.has(habit.id)) {
      return {
        ...habit,
        status: {
          ...habit.status,
          isCompleteToday: true,
        },
      };
    }
    return habit;
  });

  // Clear optimistic completions once server confirms the update.
  useEffect(() => {
    if (!serverHabits || optimisticCompletions.size === 0) return;
    const toRemove: string[] = [];
    for (const h of serverHabits) {
      if (h.id && optimisticCompletions.has(h.id) && (h.status?.isCompleteToday ?? false)) {
        toRemove.push(h.id);
      }
    }
    if (toRemove.length > 0) {
      setOptimisticCompletions(prev => {
        const next = new Set(prev);
        for (const id of toRemove) next.delete(id);
        return next;
      });
    }
  }, [serverHabits, optimisticCompletions]);

  const config = data?.config;
  const totalDebt = data?.totalDebt ? Number.parseFloat(data.totalDebt) : 0;

  // Group habits by state
  const now = new Date();
  const currentDayIndex = now.getDay();

  const todayHabits = habits.filter(h => {
    const isDayScheduled = h.days?.[currentDayIndex] ?? false;
    const isEnabled = h.enabled ?? true;
    return isDayScheduled && isEnabled;
  });

  const restDayHabits = habits.filter(h => {
    const isCompleted = h.status?.isCompleteToday || false;
    const isDayScheduled = h.days?.[currentDayIndex] ?? false;
    return !isCompleted && !isDayScheduled;
  });

  // Calculate progress
  const totalScheduledToday = todayHabits.length;
  const completedToday = todayHabits.filter(h => h.status?.isCompleteToday).length;
  const overallStreak = Math.max(...habits.map(h => h.status?.currentStreak || 0), 0);

  // Calculate week stats (freeze, skip, debt/fails) - using actual API status values
  const weekStats = habits.reduce(
    (acc, habit) => {
      const week = habit.status?.week;
      if (!week) return acc;
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
      for (const day of days) {
        const status = week[day];
        if (status === 'freeze') acc.freezes++;
        if (status === 'skip') acc.skips++;
        if (status === 'failed') acc.fails++;
      }
      return acc;
    },
    { freezes: 0, skips: 0, fails: 0 },
  );

  // creation is handled on /app/new

  const [userId, setUserId] = useState<string | null>(null);
  const [busyComplete, setBusyComplete] = useState<Record<string, boolean>>({});
  const [busyDelete, setBusyDelete] = useState<Record<string, boolean>>({});
  const [confettiKey, setConfettiKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const userTimezone = config?.principal?.timezone || 'UTC';
  const defaultCharity = config?.charity;

  // Fetch userId on mount
  useEffect(() => {
    api.alcohol.zinc.api.vUserMeList({ version: '1.0' }, { format: 'text' }).then(result => {
      result.map(id => setUserId(id));
    });
  }, [api]);

  // Celebrate after redirect from /app/new?created=1
  useEffect(() => {
    const created = router.query?.created;
    if (created === '1') {
      setConfettiKey(k => k + 1);
      setToast('Created!');
      router.replace('/app', undefined, { shallow: true });
    }
  }, [router, router.query]);

  // no createDraft here

  const refreshHabits = async (): Promise<Result<HabitPageData, Problem> | undefined> => {
    if (!userId) return undefined;
    const promise: Promise<Result<HabitPageData, Problem>> = api.alcohol.zinc.api
      .vHabitOverviewList({ version: '1.0', userId })
      .then(r =>
        r.andThen(overviewResponse =>
          api.alcohol.zinc.api.vConfigurationMeList({ version: '1.0' }).then(r2 =>
            r2.map(config => ({
              habits: overviewResponse.habits || [],
              config,
              totalDebt: overviewResponse.totalDebt || null,
            })),
          ),
        ),
      );
    setContentResult(Res.fromAsync(promise));
    return promise;
  };

  // create page handles weekday toggle

  const startEdit = (h: HabitOverviewHabitRes) => {
    if (!h.id) return;
    router.push(`/app/edit/${h.id}`);
  };

  const handleComplete = async (habit: HabitOverviewHabitRes) => {
    if (!habit.id || !habit.version?.id || !userId) return;

    // Optimistically mark as complete immediately
    setOptimisticCompletions(prev => new Set(prev).add(habit.id as string));
    setConfettiKey(k => k + 1);
    setToast('Nice work! 🎉');

    setBusyComplete(s => ({ ...s, [habit.id as string]: true }));
    const res = await api.alcohol.zinc.api.vHabitExecutionsCreate(
      { version: '1.0', userId, habitVersionId: habit.version.id },
      { notes: '' },
    );
    await res.match({
      ok: async () => {
        // Refresh from server; optimistic flag will be cleared by an effect
        // once the server reports the completion (prevents UI flicker).
        await refreshHabits();
      },
      err: problem => {
        // Roll back optimistic completion on error
        setOptimisticCompletions(prev => {
          const next = new Set(prev);
          next.delete(habit.id as string);
          return next;
        });
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/complete',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyComplete(s => ({ ...s, [habit.id as string]: false }));
  };

  const handleDelete = async (habit: HabitOverviewHabitRes) => {
    if (!habit.id || !userId) return;
    setBusyDelete(s => ({ ...s, [habit.id as string]: true }));
    const res = await api.alcohol.zinc.api.vHabitDelete({ version: '1.0', userId, id: habit.id });
    await res.match({
      ok: async () => {
        await refreshHabits();
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/delete',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyDelete(s => ({ ...s, [habit.id as string]: false }));
  };

  // create form removed

  function renderHabitRow(h: HabitOverviewHabitRes) {
    if (!h.id) return null;
    return (
      <HabitCard
        key={h.id}
        habit={h}
        userTimezone={userTimezone}
        loading={loading}
        onEdit={() => startEdit(h)}
        onComplete={() => handleComplete(h)}
        onDelete={() => handleDelete(h)}
        completing={!!busyComplete[h.id]}
        deleting={!!busyDelete[h.id]}
        showStreaks={clientConfig?.features?.showStreaks ?? false}
      />
    );
  }

  // (renderScheduleBadges) now handled inside HabitCard component

  return (
    <>
      <Head>
        <title>LazyTax — App</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Your Habits</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Stay consistent — misses help your cause.</p>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Wire up vacation mode API when available
                alert('Vacation mode coming soon! This will pause all your habits globally.');
              }}
              className="w-full md:w-auto bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-300 dark:border-yellow-700"
            >
              <Palmtree className="h-4 w-4 mr-1.5 text-yellow-600 dark:text-yellow-500" />
              Start Vacation
            </Button>
            <Button asChild className="w-full md:w-auto">
              <Link href="/app/new">
                <Plus className="h-4 w-4 mr-1" /> New Habit
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress Summary */}
        {habits.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Progress bar */}
                {totalScheduledToday > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Today's Progress</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {completedToday}/{totalScheduledToday} (
                        {Math.round((completedToday / totalScheduledToday) * 100)}%)
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.round((completedToday / totalScheduledToday) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Best Streak</p>
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-amber-500" />
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{overallStreak}</span>
                      <span className="text-sm text-slate-500">days</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">To Donate (EOM)</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${totalDebt.toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Freezes Left</p>
                    <div className="flex items-center gap-2">
                      <Snowflake className="h-4 w-4 text-blue-500" />
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {5 - weekStats.freezes}/{5}
                      </span>
                      <span className="text-xs text-slate-500">this month</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Skips Left</p>
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-4 w-4 text-slate-500" />
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                        {5 - weekStats.skips}/{5}
                      </span>
                      <span className="text-xs text-slate-500">this month</span>
                    </div>
                  </div>
                </div>

                {completedToday === totalScheduledToday && totalScheduledToday > 0 && (
                  <div className="flex justify-center pt-2">
                    <Badge className="bg-emerald-600 text-white border-0 px-3 py-1 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      All done today!
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Errors are reported via ProblemReporter; no inline dump to keep UI simple */}

        <FreeContentManager
          LoadingComponent={() => (
            <div className="grid gap-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="mt-2 h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          EmptyComponent={({ desc }) => (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No habits yet</CardTitle>
                <CardDescription>{desc ?? 'Create your first habit to get started.'}</CardDescription>
              </CardHeader>
            </Card>
          )}
          loadingState={loading}
          emptyState={desc || (habits.length === 0 ? 'No habits yet' : undefined)}
        >
          {habits.length === 0 ? null : (
            <div className="space-y-6">
              {/* Today's Habits Section */}
              {todayHabits.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Today</h2>
                    <Badge variant="secondary" className="text-xs">
                      {completedToday}/{todayHabits.length}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-3">{todayHabits.map(h => renderHabitRow(h))}</div>
                </div>
              )}

              {/* Rest Days Section */}
              {restDayHabits.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarX className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Rest Days</h2>
                    <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800">
                      {restDayHabits.length}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-3">{restDayHabits.map(h => renderHabitRow(h))}</div>
                </div>
              )}
            </div>
          )}
        </FreeContentManager>

        {/* creation moved to /app/new */}
      </div>

      {confettiKey > 0 && (
        <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <ConfettiExplosion key={confettiKey} force={0.4} duration={1000} particleCount={60} width={700} />
        </div>
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (_, { apiTree }): Promise<GetServerSidePropsResult<AppPageProps>> => {
    // First get userId from the /me endpoint
    const userIdResult = await apiTree.alcohol.zinc.api.vUserMeList({ version: '1.0' }, { format: 'text' });

    const merged: Result<HabitPageData, Problem> = userIdResult.andThen(userId =>
      apiTree.alcohol.zinc.api.vHabitOverviewList({ version: '1.0', userId }).then(r =>
        r.andThen(overviewResponse =>
          apiTree.alcohol.zinc.api.vConfigurationMeList({ version: '1.0' }).then(r2 =>
            r2.map(config => ({
              habits: overviewResponse.habits || [],
              config,
              totalDebt: overviewResponse.totalDebt || null,
            })),
          ),
        ),
      ),
    );

    return {
      props: {
        initial: await merged.serial(),
      },
    };
  },
);
