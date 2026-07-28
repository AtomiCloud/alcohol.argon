import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useClientConfig, useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type {
  ConfigurationRes,
  HabitOverviewHabitRes,
  HabitOverviewResponse,
  VacationRes,
} from '@/clients/alcohol/zinc/api';
import ConfettiExplosion from 'react-confetti-explosion';
import Toast from '@/components/Toast';
import HabitCard from '@/components/app/HabitCard';
import { FreeContentManager } from '@/lib/content/components/FreeContentManager';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useContent } from '@/lib/content/providers/useContent';
import { Res, type Result, type ResultSerial } from '@/lib/monads/result';
import { CalendarX, ChevronDown, Flame, MinusCircle, Palmtree, Plus, Snowflake, Sparkles } from 'lucide-react';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import type { Problem } from '@/lib/problem/core';
import { EmptyStateLottie } from '@/components/lottie/presets';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { TrackingEvents } from '@/lib/events';

type HabitPageData = {
  habits: HabitOverviewResponse;
  config: ConfigurationRes;
  userId: string;
  currentVacation?: VacationRes | null;
};
type AppPageProps = { initial: ResultSerial<HabitPageData, Problem> };

// API interface for shared data fetching
interface HabitPageApi {
  vHabitOverviewList: (params: { userId: string; version: string }) => Promise<Result<HabitOverviewResponse, Problem>>;
  vConfigurationMeList: (params: { version: string }) => Promise<Result<ConfigurationRes, Problem>>;
  vVacationDetail: (params: {
    userId: string;
    version: string;
    Year?: number;
    Limit?: number;
    Skip?: number;
  }) => Promise<Result<VacationRes[], Problem>>;
}

// Component to handle optimistic completion cleanup
function OptimisticCompletionCleaner({
  serverHabits,
  optimisticCompletions,
  setOptimisticCompletions,
}: {
  serverHabits: HabitOverviewHabitRes[];
  optimisticCompletions: Set<string>;
  setOptimisticCompletions: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  useEffect(() => {
    if (optimisticCompletions.size === 0) return;
    const toRemove: string[] = [];
    for (const h of serverHabits) {
      if (h.id && optimisticCompletions.has(h.id) && h.status?.isCompleteToday) {
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
  }, [serverHabits, optimisticCompletions, setOptimisticCompletions]);

  return null;
}

// Component to handle celebration redirect
function CelebrationRedirect({
  router,
  setConfettiKey,
  setToast,
}: {
  router: ReturnType<typeof useRouter>;
  setConfettiKey: React.Dispatch<React.SetStateAction<number>>;
  setToast: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  useEffect(() => {
    const created = router.query?.created;
    if (created === '1') {
      setConfettiKey(k => k + 1);
      setToast('Created!');
      router.replace('/app', undefined, { shallow: true });
    }
  }, [router, setConfettiKey, setToast]);

  return null;
}

// Component to handle progress celebration
function ProgressCelebration({
  completedToday,
  totalScheduledToday,
  lastProgressRef,
  setConfettiKey,
  setToast,
}: {
  completedToday: number;
  totalScheduledToday: number;
  lastProgressRef: React.MutableRefObject<number>;
  setConfettiKey: React.Dispatch<React.SetStateAction<number>>;
  setToast: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  useEffect(() => {
    const percent = totalScheduledToday > 0 ? Math.round((completedToday / totalScheduledToday) * 100) : 0;
    const prev = lastProgressRef.current;
    if (prev < 100 && percent >= 100) {
      setConfettiKey(k => k + 1);
      setToast("You're all done today! 🎉");
    }
    lastProgressRef.current = percent;
  }, [completedToday, totalScheduledToday, lastProgressRef, setConfettiKey, setToast]);

  return null;
}

// Shared data fetching function used by both server and client
async function fetchHabitPageData(api: HabitPageApi, userId: string): Promise<Result<HabitPageData, Problem>> {
  const habitsResult = await api.vHabitOverviewList({ userId, version: '1.0' });
  const configResult = await api.vConfigurationMeList({ version: '1.0' });
  const vacationsResult = await api.vVacationDetail({ userId, version: '1.0', Year: new Date().getFullYear() });

  return habitsResult.andThen((habits: HabitOverviewResponse) =>
    configResult.andThen((config: ConfigurationRes) =>
      vacationsResult.map((vacations: VacationRes[]) => {
        // Helper to parse date from API format (dd-MM-yyyy)
        const parseDateFromApi = (dateStr: string | null | undefined): Date | null => {
          if (!dateStr) return null;
          const [day, month, year] = dateStr.split('-');
          return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
        };

        // Find current vacation (where today is between start and end date)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentVacation = vacations.find(v => {
          if (!v.startDate || !v.endDate) return false;
          const start = parseDateFromApi(v.startDate);
          const end = parseDateFromApi(v.endDate);
          if (!start || !end) return false;
          return today >= start && today <= end;
        });

        return {
          habits,
          config,
          userId,
          currentVacation: currentVacation || null,
        };
      }),
    ),
  );
}

export default function AppPage({ initial }: AppPageProps) {
  const api = useSwaggerClients();
  const clientConfig = useClientConfig();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();
  const track = usePlausible();

  // State management
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();
  const [optimisticCompletions, setOptimisticCompletions] = useState<Set<string>>(new Set());
  const [busyComplete, setBusyComplete] = useState<Record<string, boolean>>({});
  const [busyDelete, setBusyDelete] = useState<Record<string, boolean>>({});
  const [busySkip, setBusySkip] = useState<Record<string, boolean>>({});
  const [busyVacation, setBusyVacation] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const lastProgressRef = useRef(0);

  // Content management with Result monad
  const [contentResult, setContentResult] = useState<Result<HabitPageData, Problem>>(() =>
    Res.fromSerial<HabitPageData, Problem>(initial),
  );
  const data = useContent(contentResult, {
    defaultContent: initial,
    loader,
    empty,
    notFound: 'No habits yet',
    loaderDelay: 1500,
  });

  // Early return if no data - now possible since all useEffects are in sub-components
  if (data == null) return null;

  // === Data Extraction ===
  const userId = data.userId;
  const config = data.config;
  const habitOverview = data.habits;
  const serverHabits = habitOverview.habits ?? [];
  const totalDebt = habitOverview.totalDebt ? Number.parseFloat(habitOverview.totalDebt) : 0;
  const usedSkip = habitOverview.usedSkip;
  const totalSkip = habitOverview.totalSkip;
  const usedVacation = habitOverview.usedVacation;
  const totalVacation = habitOverview.totalVacation;
  const freezeCurrent = habitOverview.freezeCurrent;
  const freezeMax = habitOverview.freezeMax;
  const isCurrentlyOnVacation = habitOverview.isCurrentlyOnVacation;
  const currentVacation = data.currentVacation;
  const userTimezone = config.principal?.timezone || 'UTC';

  // === Optimistic Updates ===
  // Merge server data with optimistic completions
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

  // === Computed Values ===
  const now = new Date();
  const currentDayIndex = now.getDay();

  const todayHabits = habits.filter(h => {
    const isDayScheduled = h.days?.[currentDayIndex] ?? false;
    const isEnabled = h.enabled ?? true;
    return isDayScheduled && isEnabled;
  });

  const restDayHabits = habits.filter(h => {
    const isDayScheduled = h.days?.[currentDayIndex] ?? false;
    return !isDayScheduled;
  });

  // Check if today is skipped for a habit
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const todayName = dayNames[currentDayIndex];
  const isHabitSkippedToday = (h: HabitOverviewHabitRes) => {
    const todayStatus = h.status?.week?.[todayName];
    return todayStatus === 'skip';
  };

  // Progress calculation: exclude skipped habits from total
  const skippedToday = todayHabits.filter(isHabitSkippedToday).length;
  const totalScheduledToday = Math.max(0, todayHabits.length - skippedToday);
  const completedToday = todayHabits.filter(h => h.status?.isCompleteToday ?? false).length;
  const overallStreak = Math.max(...habits.map(h => h.status?.currentStreak ?? 0), 0);

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

  // === Data Refresh ===
  const refreshHabits = async (): Promise<Result<HabitPageData, Problem> | undefined> => {
    if (!userId) return undefined;
    const promise = fetchHabitPageData(api.alcohol.zinc.api, userId);
    setContentResult(Res.fromAsync(promise));
    return promise;
  };

  // === Event Handlers ===
  const startEdit = (h: HabitOverviewHabitRes) => {
    if (!h.id) return;
    router.push(`/app/edit/${h.id}`);
  };

  const handleComplete = async (habit: HabitOverviewHabitRes) => {
    if (!habit.id || !habit.version?.id || !userId) return;

    track(TrackingEvents.App.Habit.Complete.Clicked);

    // Optimistically mark as complete immediately
    setOptimisticCompletions(prev => new Set(prev).add(habit.id as string));

    setBusyComplete(s => ({ ...s, [habit.id as string]: true }));
    const res = await api.alcohol.zinc.api.vHabitExecutionsCreate(
      { version: '1.0', userId, habitVersionId: habit.version.id },
      { notes: '' },
    );
    await res.match({
      ok: async () => {
        track(TrackingEvents.App.Habit.Complete.Success);
        // Refresh from server; optimistic flag will be cleared by an effect
        // once the server reports the completion (prevents UI flicker).
        await refreshHabits();
      },
      err: problem => {
        track(TrackingEvents.App.Habit.Complete.Error);
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

  const handleSkip = async (habit: HabitOverviewHabitRes) => {
    if (!habit.id || !habit.version?.id || !userId) return;

    track(TrackingEvents.App.Habit.Skip.Clicked);

    setBusySkip(s => ({ ...s, [habit.id as string]: true }));
    const res = await api.alcohol.zinc.api.vHabitExecutionsSkipCreate(
      { version: '1.0', userId, habitVersionId: habit.version.id },
      { notes: '' },
    );
    await res.match({
      ok: async () => {
        track(TrackingEvents.App.Habit.Skip.Success);
        // Refresh from server to get updated skip count and status
        await refreshHabits();
      },
      err: problem => {
        track(TrackingEvents.App.Habit.Skip.Error);
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/skip',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusySkip(s => ({ ...s, [habit.id as string]: false }));
  };

  const handleDelete = async (habit: HabitOverviewHabitRes) => {
    if (!habit.id || !userId) return;
    track(TrackingEvents.App.Habit.Delete.Clicked);
    setBusyDelete(s => ({ ...s, [habit.id as string]: true }));
    const res = await api.alcohol.zinc.api.vHabitDelete({ version: '1.0', userId, id: habit.id });
    await res.match({
      ok: async () => {
        track(TrackingEvents.App.Habit.Delete.Success);
        await refreshHabits();
      },
      err: problem => {
        track(TrackingEvents.App.Habit.Delete.Error);
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/delete',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyDelete(s => ({ ...s, [habit.id as string]: false }));
  };

  const handleNewHabitClick = () => {
    track(TrackingEvents.App.NewHabitClicked);
  };

  const handleEndVacation = async (vacationId: string) => {
    if (!userId || !currentVacation) return;

    // Format yesterday's date as dd-MM-yyyy
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatDateForApi = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    setBusyVacation(true);
    const res = await api.alcohol.zinc.api.vVacationUpdate(
      { version: '1.0', userId, id: vacationId },
      {
        startDate: currentVacation.startDate || '',
        endDate: formatDateForApi(yesterday),
      },
    );
    await res.match({
      ok: async () => {
        setToast('Vacation ended! Welcome back! 👋');
        await refreshHabits();
      },
      err: (problem: Problem) => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/vacation/end',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyVacation(false);
  };

  // === Helper Functions ===
  // Parse date from API format (dd-MM-yyyy) to JavaScript Date
  const parseDateFromApi = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
  };

  // === Render Helpers ===
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
        onSkip={() => handleSkip(h)}
        completing={busyComplete[h.id]}
        deleting={busyDelete[h.id]}
        skipping={busySkip[h.id]}
        showStreaks={clientConfig?.features?.showStreaks ?? false}
      />
    );
  }

  // === Render ===
  return (
    <>
      {/* Side-effect components (no visual render) */}
      <OptimisticCompletionCleaner
        serverHabits={serverHabits}
        optimisticCompletions={optimisticCompletions}
        setOptimisticCompletions={setOptimisticCompletions}
      />
      <CelebrationRedirect router={router} setConfettiKey={setConfettiKey} setToast={setToast} />
      <ProgressCelebration
        completedToday={completedToday}
        totalScheduledToday={totalScheduledToday}
        lastProgressRef={lastProgressRef}
        setConfettiKey={setConfettiKey}
        setToast={setToast}
      />

      <Head>
        <title>LazyTax — App</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto max-w-5xl px-4 pt-3 pb-8 space-y-3">
        {/* Only show header and habits when NOT on vacation */}
        {!isCurrentlyOnVacation && (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Your Habits</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Stay consistent — misses help your cause.</p>
            </div>
            <div className="flex flex-row flex-wrap items-stretch gap-2 w-full md:w-auto">
              <Button asChild size="sm" className="w-full md:w-auto md:h-9 md:px-4" onClick={handleNewHabitClick}>
                <Link href="/app/new">
                  <Plus className="h-4 w-4 mr-1" /> New Habit
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Progress Card (sticky) — only when there are habits today AND not on vacation */}
        {!isCurrentlyOnVacation && totalScheduledToday > 0 && (
          <div className="sticky top-14 z-10">
            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-2">
              <CardContent className="pt-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Today's Progress</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {completedToday}/{totalScheduledToday} ({Math.round((completedToday / totalScheduledToday) * 100)}
                      %)
                    </span>
                  </div>
                  <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.round((completedToday / totalScheduledToday) * 100)}%` }}
                    />
                  </div>
                  {completedToday === totalScheduledToday && (
                    <div className="flex justify-center pt-1">
                      <Badge className="bg-emerald-600 text-white border-0 px-3 py-1 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        All done today!
                      </Badge>
                    </div>
                  )}
                </div>
                {/* Embedded stats accordion */}
                <div className="mt-2 border-t border-slate-200 dark:border-slate-800">
                  <details className="group">
                    <summary className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none flex items-center justify-start gap-2 py-1">
                      <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
                      <span className="text-xs text-slate-500 group-open:hidden">Show stats</span>
                      <span className="text-xs text-slate-500 hidden group-open:inline">Hide stats</span>
                    </summary>
                    <div className="mt-0 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex flex-col">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Best Streak</p>
                          <div className="flex items-center gap-2">
                            <Flame className="h-5 w-5 text-amber-500" />
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {overallStreak}
                            </span>
                            <span className="text-sm text-slate-500">days</span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">To Donate (EOM)</p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            ${totalDebt.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Freezes</p>
                          <div className="flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-blue-500" />
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {freezeCurrent}/{freezeMax}
                            </span>
                            <span className="text-xs text-slate-500">available</span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Skips Left</p>
                          <div className="flex items-center gap-2">
                            <MinusCircle className="h-4 w-4 text-slate-500" />
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              {totalSkip - usedSkip}/{totalSkip}
                            </span>
                            <span className="text-xs text-slate-500">this month</span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Vacation Days</p>
                          <div className="flex items-center gap-2">
                            <Palmtree className="h-4 w-4 text-yellow-600" />
                            <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                              {totalVacation - usedVacation}/{totalVacation}
                            </span>
                            <span className="text-xs text-slate-500">this year</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col sm:flex-row gap-2">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                          <Link href="/app/vacations/new">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Start Vacation
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                          <Link href="/app/vacations">
                            <Palmtree className="h-4 w-4 mr-1.5" />
                            Manage Vacations
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vacation Mode Screen - Replaces everything when on vacation */}
        {isCurrentlyOnVacation && currentVacation ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="max-w-2xl w-full bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-pink-950/30 border-2 border-yellow-300 dark:border-yellow-700">
              <CardContent className="pt-12 pb-12 px-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Icon */}
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800 flex items-center justify-center shadow-lg">
                    <Palmtree className="h-14 w-14 text-yellow-700 dark:text-yellow-300" />
                  </div>

                  {/* Main Message */}
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                      You're on Vacation!
                    </h1>
                    <p className="text-lg text-slate-700 dark:text-slate-300 max-w-md mx-auto">
                      Take this time to relax and recharge. All your habits are paused.
                    </p>
                    <p className="text-base text-slate-600 dark:text-slate-400 italic">Enjoy your rest! ☀️</p>
                  </div>

                  {/* Time Remaining */}
                  {(() => {
                    const endDate = parseDateFromApi(currentVacation.endDate);
                    if (!endDate) return null;

                    // Set end date to end of day (23:59:59)
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);

                    const now = new Date();
                    const timeRemainingMs = endOfDay.getTime() - now.getTime();
                    const daysRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
                    const hoursRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                    // Format end date nicely (e.g., "13th Jan 2025")
                    const day = endDate.getDate();
                    const daySuffix =
                      day === 1 || day === 21 || day === 31
                        ? 'st'
                        : day === 2 || day === 22
                          ? 'nd'
                          : day === 3 || day === 23
                            ? 'rd'
                            : 'th';
                    const monthNames = [
                      'Jan',
                      'Feb',
                      'Mar',
                      'Apr',
                      'May',
                      'Jun',
                      'Jul',
                      'Aug',
                      'Sep',
                      'Oct',
                      'Nov',
                      'Dec',
                    ];
                    const formattedEndDate = `${day}${daySuffix} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;

                    return (
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md border border-yellow-200 dark:border-yellow-800 w-full max-w-md">
                        <div className="space-y-3">
                          <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            Vacation ends on
                          </p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formattedEndDate}</p>
                          {currentVacation.timezone && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Timezone: <span className="font-medium">{currentVacation.timezone}</span>
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-4 pt-2">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                                {daysRemaining}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                                {daysRemaining === 1 ? 'Day' : 'Days'}
                              </div>
                            </div>
                            <div className="text-2xl text-slate-400">:</div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                                {hoursRemaining}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                                {hoursRemaining === 1 ? 'Hour' : 'Hours'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  {(() => {
                    // Check if today is the start date
                    const startDate = parseDateFromApi(currentVacation.startDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isStartDateToday =
                      startDate &&
                      startDate.getFullYear() === today.getFullYear() &&
                      startDate.getMonth() === today.getMonth() &&
                      startDate.getDate() === today.getDate();

                    return (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button asChild variant="outline" size="lg">
                          <Link href={`/app/vacations/${currentVacation.id}/edit`}>
                            <Palmtree className="h-4 w-4 mr-2" />
                            Change End Date
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => currentVacation.id && handleEndVacation(currentVacation.id)}
                          disabled={busyVacation || (isStartDateToday ?? false)}
                          className="border-slate-600 dark:border-slate-400"
                          title={
                            isStartDateToday ? 'Cannot end vacation on the same day it starts' : 'End vacation today'
                          }
                        >
                          {busyVacation ? 'Ending...' : 'End Early (Today)'}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Errors are reported via ProblemReporter; no inline dump to keep UI simple */}

        {!isCurrentlyOnVacation && (
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
              <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 py-6">
                <EmptyStateLottie />
                <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">
                  {desc ?? 'Create your first habit to get started.'}
                </p>
              </div>
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

                {/* Rest Day Habits Section */}
                {restDayHabits.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarX className="h-5 w-5 text-slate-400" />
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Rest Day</h2>
                      <Badge variant="outline" className="text-xs text-slate-500">
                        {restDayHabits.length}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-3">{restDayHabits.map(h => renderHabitRow(h))}</div>
                  </div>
                )}
              </div>
            )}
          </FreeContentManager>
        )}
      </div>

      {confettiKey > 0 && (
        <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <ConfettiExplosion key={confettiKey} force={0.4} duration={1000} particleCount={65} width={600} />
        </div>
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (_, { apiTree }): Promise<GetServerSidePropsResult<AppPageProps>> => {
    const api = apiTree.alcohol.zinc.api;

    // Get userId and fetch page data using shared function
    const userIdResult = await api.vUserMeList({ version: '1.0' }, { format: 'text' });
    const pageDataResult = await userIdResult.andThen(userId => fetchHabitPageData(api, userId));

    return {
      props: {
        initial: await pageDataResult.serial(),
      },
    };
  },
);
