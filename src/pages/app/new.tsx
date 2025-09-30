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
import type { CharityPrincipalRes, CreateHabitReq } from '@/clients/alcohol/zinc/api';
import StakeSheet from '@/components/app/StakeSheet';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { Settings, ChevronDown, ChevronRight, DollarSign, Save, X } from 'lucide-react';
import type { ResultSerial } from '@/lib/monads/result';
import { Res, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

type NewHabitPageData = { charities: CharityPrincipalRes[] };
type NewHabitPageProps = { initial: ResultSerial<NewHabitPageData, Problem> };

const WEEKDAYS = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
  { key: 'SUNDAY', label: 'Sun' },
] as const;

type HabitDraft = {
  task: string;
  daysOfWeek: string[];
  notificationTime: string; // UI HH:mm
  amount: string; // number as string for UI
  currency: string; // e.g., 'USD'
  charityId: string;
  enabled: boolean;
};

const defaultDraft = (charityId?: string): HabitDraft => ({
  task: '',
  daysOfWeek: WEEKDAYS.map(w => w.key),
  notificationTime: '22:00',
  amount: '',
  currency: 'USD',
  charityId: charityId ?? '',
  enabled: true,
});

const toHHMMSS = (t: string | undefined | null): string | null => {
  if (!t) return null;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return null;
};

export default function NewHabitPage({ initial }: NewHabitPageProps) {
  const api = useSwaggerClients();
  const [loading, loader] = useFreeLoader();
  const problemReporter = useProblemReporter();
  const router = useRouter();

  const [data] = useState(() => Res.fromSerial<NewHabitPageData, Problem>(initial));
  const [charities, setCharities] = useState<CharityPrincipalRes[]>([]);

  useEffect(() => {
    data.map(d => setCharities(d.charities));
  }, [data]);

  const charityOptions = useMemo(() => charities.filter(c => !!c.id), [charities]);

  const [draft, setDraft] = useState<HabitDraft>(defaultDraft(charityOptions[0]?.id ?? ''));
  useEffect(() => {
    if (!draft.charityId && charityOptions[0]?.id) {
      setDraft(d => ({ ...d, charityId: charityOptions[0]!.id! }));
    }
  }, [charityOptions, draft.charityId]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeBuffer, setStakeBuffer] = useState('');

  const toggleWeekday = (key: string) => {
    setDraft(d => ({
      ...d,
      daysOfWeek: d.daysOfWeek.includes(key) ? d.daysOfWeek.filter(k => k !== key) : [...d.daysOfWeek, key],
    }));
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

  const keypadAppend = (k: string) => {
    setStakeBuffer(prev => {
      if (k === 'C') return '';
      if (k === '⌫') return prev.slice(0, -1);
      if (/^\d$/.test(k)) return (prev + k).replace(/^0+(?=\d)/, '');
      return prev;
    });
  };

  const openStakeModal = () => {
    setStakeBuffer(amountToCents(draft.amount || ''));
    setStakeModalOpen(true);
  };

  const confirmStakeModal = () => {
    const val = formatCentsToAmount(stakeBuffer);
    setDraft(d => ({ ...d, amount: val }));
    setStakeModalOpen(false);
  };

  const validateDraft = (d: HabitDraft): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!d.task || d.task.trim().length < 3) errs.task = 'Please enter a task (min 3 chars)';
    const amt = d.amount?.trim();
    if (amt) {
      const isAmountFormat = /^(?:\d+|\d+\.\d{1,2})$/.test(amt);
      if (!isAmountFormat || Number(amt) <= 0) errs.amount = 'Enter a valid amount (e.g., 5 or 5.50)';
      if (!d.charityId) errs.charityId = 'Please select a charity';
    }
    return errs;
  };

  const handleCreate = async () => {
    const errs = validateDraft(draft);
    if (Object.keys(errs).length > 0) return;
    loader.startLoading();
    const payload: CreateHabitReq = {
      task: draft.task || null,
      daysOfWeek: draft.daysOfWeek.length ? draft.daysOfWeek : [],
      notificationTime: toHHMMSS(draft.notificationTime),
      stake: draft.amount ? `${draft.amount}` : '0',
      charityId: draft.charityId,
    };
    const res = await api.alcohol.zinc.api.vHabitCreate({ version: '1.0' }, payload);
    await res.match({
      ok: async () => {
        await router.replace('/app?created=1');
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/create',
          problem,
        });
      },
    });
    loader.stopLoading();
  };

  const errs = validateDraft(draft);

  return (
    <>
      <Head>
        <title>LazyTax — New Habit</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">New Habit</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Define your habit and optional stake.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/app">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-amber-200/60 dark:border-amber-300/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Create a new habit ✨</CardTitle>
            <CardDescription className="text-xs">Set what you’ll do and your stake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block text-sm mb-1" htmlFor="create-task">
                  Task
                </label>
                <Input
                  id="create-task"
                  placeholder="e.g., Read 15 minutes"
                  value={draft.task}
                  onChange={e => setDraft(d => ({ ...d, task: e.target.value }))}
                  className="h-14 text-base"
                />
                {errs.task && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errs.task}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 dark:text-slate-200">Stake (optional)</span>
                  {!draft.amount ? (
                    <Button
                      size="sm"
                      onClick={openStakeModal}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                    >
                      <DollarSign className="h-4 w-4 mr-1" /> Set amount
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
                        <DollarSign className="h-4 w-4" />
                        <span className="tabular-nums">{draft.amount}</span>
                        <span className="text-xs ml-0.5">USD</span>
                      </span>
                      <Button variant="outline" size="sm" onClick={openStakeModal} aria-label="Change stake">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDraft(d => ({ ...d, amount: '' }))}
                        aria-label="Clear stake"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {errs.amount && <p className="text-xs text-red-600 dark:text-red-400">{errs.amount}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(s => !s)}
                className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                {showAdvanced ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <Settings className="h-3.5 w-3.5" /> Advanced (optional)
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-5 rounded-lg border p-3 border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <p className="block text-sm">Days of week</p>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map(d => {
                      const active = draft.daysOfWeek.includes(d.key);
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => toggleWeekday(d.key)}
                          className={`text-[11px] rounded-md border px-2.5 py-1 transition-colors ${
                            active
                              ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-pink-500'
                              : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {[
                      { k: 'Everyday', v: WEEKDAYS.map(w => w.key) },
                      { k: 'Weekdays', v: WEEKDAYS.slice(0, 5).map(w => w.key) },
                      { k: 'Weekends', v: WEEKDAYS.slice(5).map(w => w.key) },
                      { k: 'Clear', v: [] as string[] },
                    ].map(preset => (
                      <button
                        key={preset.k}
                        type="button"
                        onClick={() => setDraft(d => ({ ...d, daysOfWeek: preset.v }))}
                        className="text-[11px] rounded-full border px-3 py-1 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {preset.k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm" htmlFor="create-time">
                    Notification time
                  </label>
                  <Input
                    id="create-time"
                    type="time"
                    value={draft.notificationTime}
                    onChange={e => setDraft(d => ({ ...d, notificationTime: e.target.value }))}
                    className="w-40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm" htmlFor="create-charity">
                    Charity
                  </label>
                  <select
                    id="create-charity"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={draft.charityId}
                    onChange={e => setDraft(d => ({ ...d, charityId: e.target.value }))}
                  >
                    {charityOptions.map(c => (
                      <option key={c.id!} value={c.id!}>
                        {c.name || c.email || c.id}
                      </option>
                    ))}
                  </select>
                  {errs.charityId && <p className="text-xs text-red-600 dark:text-red-400">{errs.charityId}</p>}
                </div>
              </div>
            )}

            <div className="pt-1">
              <Button
                onClick={handleCreate}
                disabled={loading || Object.keys(errs).length > 0}
                className="w-full h-12 text-base bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 text-white"
              >
                Create Habit
              </Button>
            </div>
          </CardContent>
        </Card>
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
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (_, { apiTree }): Promise<GetServerSidePropsResult<NewHabitPageProps>> => {
    const charities: Result<NewHabitPageData, Problem> = await apiTree.alcohol.zinc.api
      .vCharityList({ version: '1.0' })
      .then(r => r.map(list => ({ charities: list })));

    return {
      props: {
        initial: await charities.serial(),
      },
    };
  },
);
