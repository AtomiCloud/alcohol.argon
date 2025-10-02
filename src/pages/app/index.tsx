import { useEffect, useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { useClientConfig } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, HabitVersionRes, UpdateHabitReq } from '@/clients/alcohol/zinc/api';
import Confetti from '@/components/Confetti';
import Toast from '@/components/Toast';
import HabitCard from '@/components/app/HabitCard';
import StakeSheet from '@/components/app/StakeSheet';
import HabitEditorCard from '@/components/app/HabitEditorCard';
import { FreeContentManager } from '@/lib/content/components/FreeContentManager';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useContent } from '@/lib/content/providers/useContent';
import { Res, Err, Ok, type ResultSerial, type Result } from '@/lib/monads/result';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import type { Problem } from '@/lib/problem/core';
import { defaultHabitDraft, type HabitDraft } from '@/models/habit';
import { amountToCents, formatCentsToAmount, parseStake, toHHMMSS, toHM } from '@/lib/utility/habit-utils';
import { normalizeDecimalString } from '@/lib/utility/money-utils';

type HabitPageData = { habits: HabitVersionRes[]; charities: CharityPrincipalRes[] };
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
  // Errors are reported via ProblemReporter; no local error state rendered
  const [contentResult, setContentResult] = useState<Result<HabitPageData, Problem>>(() =>
    Res.fromSerial<HabitPageData, Problem>(initial),
  );
  const data = useContent(contentResult, {
    defaultContent: initial,
    loader,
    empty,
    notFound: 'No habits yet',
    loaderDelay: 120,
  });
  const habits = data?.habits ?? [];
  const charities = data?.charities ?? [];

  // creation is handled on /app/new

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, HabitDraft>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyComplete, setBusyComplete] = useState<Record<string, boolean>>({});
  const [busyDelete, setBusyDelete] = useState<Record<string, boolean>>({});
  const [busyUpdate, setBusyUpdate] = useState<Record<string, boolean>>({});
  // advanced create handled on /app/new
  // advanced edit options are handled within HabitEditorCard
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeModalMode, setStakeModalMode] = useState<{ type: 'edit'; habitId: string } | null>(null);
  const [stakeBuffer, setStakeBuffer] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const charityOptions = useMemo(() => charities.filter(c => !!c.id), [charities]);

  // Celebrate after redirect from /app/new?created=1
  useEffect(() => {
    const created = router.query?.created;
    if (created === '1') {
      setShowConfetti(true);
      setToast('Created!');
      router.replace('/app', undefined, { shallow: true });
    }
  }, [router, router.query]);

  // no createDraft here

  const refreshHabits = async () => {
    const promise: Promise<Result<HabitPageData, Problem>> = api.alcohol.zinc.api
      .vHabitList({ version: '1.0' })
      .then(r =>
        r.andThen(habits =>
          api.alcohol.zinc.api
            .vCharityList({ version: '1.0' })
            .then(r2 => r2.map(charities => ({ habits, charities }))),
        ),
      );
    setContentResult(Res.fromAsync(promise));
  };

  // create page handles weekday toggle

  // weekday toggling handled by HabitEditorCard via onChange

  const keypadAppend = (k: string) => {
    // Treat buffer as cents digits (no dot); 100 => $1.00
    setStakeBuffer(prev => {
      if (k === 'C') return '';
      if (k === '⌫') return prev.slice(0, -1);
      if (/^\d$/.test(k)) return (prev + k).replace(/^0+(?=\d)/, '');
      return prev;
    });
  };

  // stake for create handled on /app/new

  const openStakeModalForEdit = (habitId: string) => {
    const current = editDraft[habitId]?.amount ?? '';
    setStakeBuffer(amountToCents(current));
    setStakeModalMode({ type: 'edit', habitId });
    setStakeModalOpen(true);
  };

  const confirmStakeModal = () => {
    if (!stakeModalMode) return;
    const val = formatCentsToAmount(stakeBuffer);
    if (stakeModalMode.type === 'edit') {
      const { habitId } = stakeModalMode;
      setEditDraft(d => ({ ...d, [habitId]: { ...(d[habitId] || defaultHabitDraft()), amount: val } }));
    }
    setStakeModalOpen(false);
  };

  const validateDraft = (d: HabitDraft): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!d.task || d.task.trim().length < 3) errs.task = 'Please enter a habit (min 3 chars)';
    // Stake is optional; if present, must be x or x.xx (up to 2 decimals) and > 0
    const amt = d.amount?.trim();
    if (amt) {
      const norm = normalizeDecimalString(amt);
      const isAmountFormat = /^(?:\d+|\d+\.\d{1,2})$/.test(norm);
      if (!isAmountFormat || Number(norm) <= 0) errs.amount = 'Enter a valid amount (e.g., 5 or 5.50)';
      // Charity is only required if staking
      if (!d.charityId) errs.charityId = 'Please select a charity';
    }
    return errs;
  };

  // creation moved to dedicated page

  const startEdit = (h: HabitVersionRes) => {
    setEditingId(h.habitId);
    setEditDraft(prev => ({
      ...prev,
      [h.habitId]: {
        task: h.task ?? '',
        daysOfWeek: (h.daysOfWeek as string[]) ?? [],
        notificationTime: toHM(h.notificationTime ?? ''),
        ...parseStake(h.stake ?? ''),
        charityId: h.charityId,
        enabled: true,
      },
    }));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (habit: HabitVersionRes) => {
    const draft = editDraft[habit.habitId];
    if (!draft) return;
    const errs = validateDraft(draft);
    if (Object.keys(errs).length > 0) return;

    const payload: UpdateHabitReq = {
      task: draft.task || null,
      daysOfWeek: draft.daysOfWeek?.length ? draft.daysOfWeek : [],
      notificationTime: draft.notificationTime ? toHHMMSS(draft.notificationTime) : null,
      stake: draft.amount ? `${draft.amount}` : '0',
      charityId: draft.charityId,
      enabled: draft.enabled,
    };

    setBusyUpdate(s => ({ ...s, [habit.habitId]: true }));
    const res = await api.alcohol.zinc.api.vHabitUpdate({ version: '1.0', id: habit.habitId }, payload);
    await res.match({
      ok: _data => {
        setEditingId(null);
        refreshHabits();
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/update',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyUpdate(s => ({ ...s, [habit.habitId]: false }));
  };

  const handleComplete = async (habit: HabitVersionRes) => {
    setBusyComplete(s => ({ ...s, [habit.habitId]: true }));
    const res = await api.alcohol.zinc.api.vHabitExecutionsCreate({ version: '1.0', id: habit.habitId }, { notes: '' });
    await res.match({
      ok: async () => {
        await refreshHabits();
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/complete',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyComplete(s => ({ ...s, [habit.habitId]: false }));
  };

  const handleDelete = async (habit: HabitVersionRes) => {
    setBusyDelete(s => ({ ...s, [habit.habitId]: true }));
    const res = await api.alcohol.zinc.api.vHabitDelete({ version: '1.0', id: habit.habitId });
    await res.match({
      ok: async () => {
        setDeletingId(null);
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
    setBusyDelete(s => ({ ...s, [habit.habitId]: false }));
  };

  // create form removed

  function renderHabitRow(h: HabitVersionRes) {
    const isEditing = editingId === h.habitId;
    const draft = editDraft[h.habitId];
    const errs = draft ? validateDraft(draft) : {};

    if (!isEditing) {
      return (
        <HabitCard
          key={`${h.habitId}-${h.id}`}
          habit={h}
          charityName={charityOptions.find(c => c.id === h.charityId)?.name || null}
          loading={loading}
          onEdit={() => startEdit(h)}
          onComplete={() => handleComplete(h)}
          onDelete={() => handleDelete(h)}
          completing={!!busyComplete[h.habitId]}
          deleting={!!busyDelete[h.habitId]}
          showStreaks={clientConfig?.features?.showStreaks ?? false}
        />
      );
    }

    return (
      <Card key={`${h.habitId}-${h.id}`} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-1">
          <CardTitle className="text-base truncate">{h.task || 'Untitled habit'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <HabitEditorCard
            draft={{
              task: draft?.task ?? '',
              daysOfWeek: draft?.daysOfWeek ?? [],
              notificationTime: draft?.notificationTime ? draft.notificationTime : '',
              amount: draft?.amount ?? '',
              charityId: draft?.charityId ?? '',
            }}
            onChange={d =>
              setEditDraft(prev => ({
                ...prev,
                [h.habitId]: { ...(prev[h.habitId] || defaultHabitDraft()), ...d },
              }))
            }
            charities={charityOptions.map(c => ({ id: c.id!, label: c.name || c.email || c.id! }))}
            errors={errs}
            submitted={true}
            onOpenStake={() => openStakeModalForEdit(h.habitId)}
            onClearStake={() =>
              setEditDraft(prev => ({
                ...prev,
                [h.habitId]: { ...(prev[h.habitId] || defaultHabitDraft()), amount: '' },
              }))
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {deletingId === h.habitId ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400">Confirm delete?</span>
                <Button variant="destructive" onClick={() => handleDelete(h)} disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                <Button variant="outline" onClick={() => setDeletingId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="destructive" onClick={() => setDeletingId(h.habitId)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleUpdate(h)}
                disabled={loading || !!busyUpdate[h.habitId]}
                className="relative"
              >
                <Spinner
                  className={`absolute left-2 transition-opacity ${busyUpdate[h.habitId] ? 'opacity-100' : 'opacity-0'}`}
                  size="sm"
                />
                <Save
                  className={`h-4 w-4 mr-1 transition-opacity ${busyUpdate[h.habitId] ? 'opacity-0' : 'opacity-100'}`}
                />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Your Habits</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Stay consistent — misses help your cause.</p>
          </div>
          <Button asChild>
            <Link href="/app/new">
              <Plus className="h-4 w-4 mr-1" /> New Habit
            </Link>
          </Button>
        </div>

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
          {habits.length === 0 ? null : <div className="grid gap-3">{habits.map(h => renderHabitRow(h))}</div>}
        </FreeContentManager>

        {/* creation moved to /app/new */}
      </div>

      <StakeSheet
        open={stakeModalOpen}
        amountCents={stakeBuffer}
        onAppend={keypadAppend}
        onQuick={v => setStakeBuffer(String(v * 100))}
        onClear={() => setStakeBuffer('')}
        onClose={() => setStakeModalOpen(false)}
        onConfirm={confirmStakeModal}
      />

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (_, { apiTree }): Promise<GetServerSidePropsResult<AppPageProps>> => {
    const merged: Result<HabitPageData, Problem> = await apiTree.alcohol.zinc.api
      .vHabitList({ version: '1.0' })
      .then(r =>
        r.andThen(habits =>
          apiTree.alcohol.zinc.api
            .vCharityList({ version: '1.0' })
            .then(r2 => r2.map(charities => ({ habits, charities }))),
        ),
      );

    return {
      props: {
        initial: await merged.serial(),
      },
    };
  },
);
