import { useEffect, useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { CharityPrincipalRes, HabitVersionRes, UpdateHabitReq } from '@/clients/alcohol/zinc/api';
import Confetti from '@/components/Confetti';
import Toast from '@/components/Toast';
import HabitCard from '@/components/app/HabitCard';
import StakeSheet from '@/components/app/StakeSheet';
import { FreeContentManager } from '@/lib/content/components/FreeContentManager';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useContent } from '@/lib/content/providers/useContent';
import { Res, Err, Ok, type ResultSerial, type Result } from '@/lib/monads/result';
import { Check, Edit, Plus, Save, Trash2, X, Settings, ChevronDown, ChevronRight, DollarSign } from 'lucide-react';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { Problem } from '@/lib/problem/core';

type HabitPageData = { habits: HabitVersionRes[]; charities: CharityPrincipalRes[] };
type AppPageProps = { initial: ResultSerial<HabitPageData, Problem> };

type HabitDraft = {
  task: string;
  daysOfWeek: string[];
  notificationTime: string; // UI HH:mm
  amount: string; // number as string for UI
  currency: string; // e.g., 'USD'
  charityId: string;
  enabled: boolean;
};

const WEEKDAYS = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
  { key: 'SUNDAY', label: 'Sun' },
] as const;

const defaultDraft = (charityId?: string): HabitDraft => ({
  task: '',
  daysOfWeek: WEEKDAYS.map(w => w.key),
  notificationTime: '22:00',
  amount: '',
  currency: 'USD',
  charityId: charityId ?? '',
  enabled: true,
});

export default function AppPage({ initial }: AppPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
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
  // advanced create handled on /app/new
  const [showEditAdvanced, setShowEditAdvanced] = useState<Record<string, boolean>>({});
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

  const toggleEditWeekday = (habitId: string, key: string) => {
    setEditDraft(d => {
      const cur = d[habitId] || defaultDraft();
      const next = cur.daysOfWeek.includes(key) ? cur.daysOfWeek.filter(k => k !== key) : [...cur.daysOfWeek, key];
      return { ...d, [habitId]: { ...cur, daysOfWeek: next } };
    });
  };

  const toHHMMSS = (t: string | undefined | null): string | null => {
    if (!t) return null;
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
    if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
    return null;
  };

  const toHM = (t: string | undefined | null): string => {
    if (!t) return '';
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(t)) return t;
    return '';
  };

  const parseStake = (s: string | undefined | null): { amount: string; currency: string } => {
    if (!s) return { amount: '', currency: 'USD' };
    const match = s.toString().match(/([0-9]+(?:[.,][0-9]+)?)/);
    const amount = match ? match[1].replace(',', '.') : '';
    return { amount, currency: 'USD' };
  };

  const sanitizeAmountInput = (raw: string): string => {
    // Allow digits and a single dot. Convert commas to dots.
    const v = raw.replace(/,/g, '.');
    const cleaned = v.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join('')}`;
  };

  const keypadAppend = (k: string) => {
    // Treat buffer as cents digits (no dot); 100 => $1.00
    setStakeBuffer(prev => {
      if (k === 'C') return '';
      if (k === '⌫') return prev.slice(0, -1);
      if (/^\d$/.test(k)) return (prev + k).replace(/^0+(?=\d)/, '');
      return prev;
    });
  };

  const formatCentsToAmount = (cents: string): string => {
    if (!cents) return '0.00';
    const n = Math.max(0, Number.parseInt(cents, 10) || 0);
    const dollars = Math.floor(n / 100);
    const centsPart = String(n % 100).padStart(2, '0');
    return `${dollars}.${centsPart}`;
  };

  const amountToCents = (amount: string): string => {
    if (!amount) return '';
    const s = amount.replace(/,/g, '.');
    const [i, f = ''] = s.split('.');
    const intPart = (i || '0').replace(/\D/g, '') || '0';
    const fracRaw = f.replace(/\D/g, '').slice(0, 2);
    const fracPad = `${fracRaw}00`.slice(0, 2);
    const cents = Number.parseInt(intPart, 10) * 100 + Number.parseInt(fracPad || '0', 10);
    return String(Number.isNaN(cents) ? 0 : cents);
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
      setEditDraft(d => ({ ...d, [habitId]: { ...(d[habitId] || defaultDraft()), amount: val } }));
    }
    setStakeModalOpen(false);
  };

  const validateDraft = (d: HabitDraft): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!d.task || d.task.trim().length < 3) errs.task = 'Please enter a task (min 3 chars)';
    // Stake is optional; if present, must be x or x.xx (up to 2 decimals) and > 0
    const amt = d.amount?.trim();
    if (amt) {
      const isAmountFormat = /^(?:\d+|\d+\.\d{1,2})$/.test(amt);
      if (!isAmountFormat || Number(amt) <= 0) errs.amount = 'Enter a valid amount (e.g., 5 or 5.50)';
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

    loader.startLoading();
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
      },
    });
    loader.stopLoading();
  };

  const handleComplete = async (habit: HabitVersionRes) => {
    loader.startLoading();
    const res = await api.alcohol.zinc.api.vHabitExecutionsCreate(
      { version: '1.0', id: habit.habitId },
      { notes: null },
    );
    await res.match({
      ok: async () => {
        refreshHabits();
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/complete',
          problem,
        });
      },
    });
    loader.stopLoading();
  };

  const handleDelete = async (habit: HabitVersionRes) => {
    loader.startLoading();
    const res = await api.alcohol.zinc.api.vHabitDelete({ version: '1.0', id: habit.habitId });
    await res.match({
      ok: async () => {
        setDeletingId(null);
        refreshHabits();
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/delete',
          problem,
        });
      },
    });
    loader.stopLoading();
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
        />
      );
    }

    return (
      <Card key={`${h.habitId}-${h.id}`} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-1">
          <CardTitle className="text-base truncate">{h.task || 'Untitled habit'}</CardTitle>
        </CardHeader>
        {
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm mb-1" htmlFor={`edit-task-${h.habitId}`}>
                  Task
                </label>
                <Input
                  id={`edit-task-${h.habitId}`}
                  value={draft?.task ?? ''}
                  onChange={e =>
                    setEditDraft(d => ({
                      ...d,
                      [h.habitId]: { ...(d[h.habitId] || defaultDraft()), task: e.target.value },
                    }))
                  }
                  className="h-12 text-base"
                />
                {'task' in errs && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errs.task}</p>}
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  Stake (optional)
                </div>
                <div className="flex flex-col items-center gap-2 py-1">
                  {!draft?.amount ? (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => openStakeModalForEdit(h.habitId)}
                      className="px-6"
                    >
                      <DollarSign className="h-4 w-4 mr-2" /> Select Stake
                    </Button>
                  ) : (
                    <>
                      <div className="text-3xl font-semibold">
                        <span className="text-emerald-600">$</span>
                        <span className="tabular-nums">{draft.amount}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">USD</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openStakeModalForEdit(h.habitId)}>
                          Change
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditDraft(d => ({
                              ...d,
                              [h.habitId]: { ...(d[h.habitId] || defaultDraft()), amount: '' },
                            }))
                          }
                          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          Remove
                        </Button>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">If you miss, we donate it 💝</p>
                </div>
                {'amount' in errs && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 text-center">{errs.amount}</p>
                )}
              </div>

              <div className="md:col-span-2 -mt-1">
                <button
                  type="button"
                  onClick={() => setShowEditAdvanced(s => ({ ...s, [h.habitId]: !s[h.habitId] }))}
                  className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
                >
                  {showEditAdvanced[h.habitId] ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  <Settings className="h-3.5 w-3.5" />
                  Advanced (optional)
                </button>
              </div>

              {showEditAdvanced[h.habitId] && (
                <div className="md:col-span-2 space-y-4 rounded-lg border p-3 border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="block text-sm mb-2">Days of week</p>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map(dy => {
                        const active = (draft?.daysOfWeek || []).includes(dy.key);
                        return (
                          <button
                            key={dy.key}
                            type="button"
                            onClick={() => toggleEditWeekday(h.habitId, dy.key)}
                            className={`text-[11px] rounded-full border px-3 py-1 transition-colors shadow-sm ${
                              active
                                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-pink-500'
                                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {dy.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1" htmlFor={`edit-time-${h.habitId}`}>
                      Notification Time
                    </label>
                    <Input
                      id={`edit-time-${h.habitId}`}
                      type="time"
                      value={draft?.notificationTime ?? ''}
                      onChange={e =>
                        setEditDraft(d => ({
                          ...d,
                          [h.habitId]: { ...(d[h.habitId] || defaultDraft()), notificationTime: e.target.value },
                        }))
                      }
                      className="w-40"
                    />
                    {'notificationTime' in errs && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errs.notificationTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2" htmlFor={`edit-charity-${h.habitId}`}>
                      Charity
                    </label>
                    <select
                      id={`edit-charity-${h.habitId}`}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={draft?.charityId ?? charityOptions[0]?.id ?? ''}
                      onChange={e =>
                        setEditDraft(d => ({
                          ...d,
                          [h.habitId]: { ...(d[h.habitId] || defaultDraft()), charityId: e.target.value },
                        }))
                      }
                    >
                      {charityOptions.map(c => (
                        <option key={c.id!} value={c.id!}>
                          {c.name || c.email || c.id}
                        </option>
                      ))}
                    </select>
                    {'charityId' in errs && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errs.charityId}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
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
                <Button onClick={() => handleUpdate(h)} disabled={loading}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </CardContent>
        }
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
          emptyState={desc}
        >
          <div className="grid gap-3">{habits.map(h => renderHabitRow(h))}</div>
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
