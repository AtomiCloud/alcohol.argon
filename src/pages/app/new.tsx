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
import type { CharityPrincipalRes, CreateHabitReq } from '@/clients/alcohol/zinc/api';
import StakeSheet from '@/components/app/StakeSheet';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { ResultSerial } from '@/lib/monads/result';
import { Res, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import HabitEditorCard from '@/components/app/HabitEditorCard';
import { defaultHabitDraft, type HabitDraft } from '@/models/habit';
import { amountToCents, formatCentsToAmount, toHHMMSS } from '@/lib/utility/habit-utils';
import { normalizeDecimalString } from '@/lib/utility/money-utils';

type NewHabitPageData = { charities: CharityPrincipalRes[] };
type NewHabitPageProps = { initial: ResultSerial<NewHabitPageData, Problem> };

export default function NewHabitPage({ initial }: NewHabitPageProps) {
  const api = useSwaggerClients();
  const [loading, loader] = useFreeLoader();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();

  const [data] = useState(() => Res.fromSerial<NewHabitPageData, Problem>(initial));
  const [charities, setCharities] = useState<CharityPrincipalRes[]>([]);

  useEffect(() => {
    data.map(d => setCharities(d.charities));
  }, [data]);

  const charityOptions = useMemo(() => charities.filter(c => !!c.id), [charities]);

  const [draft, setDraft] = useState<HabitDraft>(defaultHabitDraft(charityOptions[0]?.id ?? ''));
  useEffect(() => {
    if (!draft.charityId && charityOptions[0]?.id) {
      setDraft(d => ({ ...d, charityId: charityOptions[0]!.id! }));
    }
  }, [charityOptions, draft.charityId]);

  // Advanced controls are handled inside HabitEditorCard
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeBuffer, setStakeBuffer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busyCreate, setBusyCreate] = useState(false);

  // Weekday toggling handled in HabitEditorCard

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
    if (!d.task || d.task.trim().length < 3) errs.task = 'Please enter a habit (min 3 chars)';
    if (!d.daysOfWeek || d.daysOfWeek.length === 0) errs.daysOfWeek = 'Choose at least one day of the week';
    const amt = d.amount?.trim();
    if (amt) {
      const norm = normalizeDecimalString(amt);
      const isAmountFormat = /^(?:\d+|\d+\.\d{1,2})$/.test(norm);
      if (!isAmountFormat || Number(norm) <= 0) errs.amount = 'Enter a valid amount (e.g., 5 or 5.50)';
      if (!d.charityId) errs.charityId = 'Please select a charity';
    }
    return errs;
  };

  const handleCreate = async () => {
    setSubmitted(true);
    const errs = validateDraft(draft);
    if (Object.keys(errs).length > 0) return;
    setBusyCreate(true);
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
        errorHandler.throwProblem(problem);
      },
    });
    setBusyCreate(false);
  };

  const errs = validateDraft(draft);

  // Charity combobox is provided in HabitEditorCard

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
            <HabitEditorCard
              draft={{
                task: draft.task,
                daysOfWeek: draft.daysOfWeek,
                notificationTime: draft.notificationTime,
                amount: draft.amount,
                charityId: draft.charityId,
              }}
              onChange={d => setDraft(prev => ({ ...prev, ...d }))}
              charities={charityOptions.map(c => ({ id: c.id!, label: c.name || c.email || c.id! }))}
              errors={errs}
              submitted={submitted}
              onOpenStake={openStakeModal}
              onClearStake={() => setDraft(d => ({ ...d, amount: '' }))}
            />

            <div className="pt-1">
              <Button
                onClick={handleCreate}
                disabled={loading || Object.keys(errs).length > 0 || busyCreate}
                className="relative w-full h-12 text-base bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 text-white"
              >
                <Spinner
                  className={`absolute left-3 transition-opacity ${busyCreate ? 'opacity-100' : 'opacity-0'}`}
                  size="sm"
                />
                <span className={`${busyCreate ? 'opacity-70' : ''}`}>Create Habit</span>
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
