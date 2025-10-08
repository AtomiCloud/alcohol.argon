import { useEffect, useMemo, useState } from 'react';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, HabitVersionRes, UpdateHabitReq } from '@/clients/alcohol/zinc/api';
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
import { amountToCents, formatCentsToAmount, toHHMMSS, toHM } from '@/lib/utility/habit-utils';
import { normalizeDecimalString } from '@/lib/utility/money-utils';

type EditHabitPageData = {
  habit: HabitVersionRes;
  charities: CharityPrincipalRes[];
  defaultCharityId: string | null;
  timezone: string | null;
};
type EditHabitPageProps = { initial: ResultSerial<EditHabitPageData, Problem> };

export default function EditHabitPage({ initial }: EditHabitPageProps) {
  const api = useSwaggerClients();
  const [loading, loader] = useFreeLoader();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();

  const [data] = useState(() => Res.fromSerial<EditHabitPageData, Problem>(initial));
  const [habit, setHabit] = useState<HabitVersionRes | null>(null);
  const [charities, setCharities] = useState<CharityPrincipalRes[]>([]);
  const [defaultCharityId, setDefaultCharityId] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('UTC');

  useEffect(() => {
    data.map(d => {
      setHabit(d.habit);
      setCharities(d.charities);
      setDefaultCharityId(d.defaultCharityId || '');
      setTimezone(d.timezone || 'UTC');
    });
  }, [data]);

  const charityOptions = useMemo(() => charities.filter(c => !!c.id), [charities]);

  const [draft, setDraft] = useState<HabitDraft>(defaultHabitDraft(''));

  // Initialize draft from habit data
  useEffect(() => {
    if (habit) {
      setDraft({
        task: habit.task || '',
        daysOfWeek: habit.daysOfWeek || [],
        notificationTime: toHM(habit.notificationTime || ''),
        amount: habit.stake ? String(habit.stake) : '',
        currency: 'USD',
        charityId: habit.charityId || '',
        enabled: true,
      });
    }
  }, [habit]);

  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeBuffer, setStakeBuffer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busyUpdate, setBusyUpdate] = useState(false);

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
    if (amt && Number(amt) > 0) {
      const norm = normalizeDecimalString(amt);
      const isAmountFormat = /^(?:\d+|\d+\.\d{1,2})$/.test(norm);
      if (!isAmountFormat || Number(norm) <= 0) errs.amount = 'Enter a valid amount (e.g., 5 or 5.50)';
      if (!d.charityId) errs.charityId = 'Please select a charity';
    }
    return errs;
  };

  const handleUpdate = async () => {
    if (!habit?.habitId) return;
    setSubmitted(true);
    const errs = validateDraft(draft);
    if (Object.keys(errs).length > 0) return;
    setBusyUpdate(true);

    // Get userId first
    const userIdResult = await api.alcohol.zinc.api.vUserMeList({ version: '1.0' }, { format: 'text' });
    const userIdOk = userIdResult.isOk();
    if (!userIdOk) {
      setBusyUpdate(false);
      return;
    }

    const userId = await userIdResult.unwrap();
    const hasStake = draft.amount && Number(draft.amount) > 0;
    const payload: UpdateHabitReq = {
      task: draft.task || null,
      daysOfWeek: draft.daysOfWeek.length ? draft.daysOfWeek : [],
      notificationTime: draft.notificationTime ? toHHMMSS(draft.notificationTime) : null,
      stake: hasStake ? `${draft.amount}` : '0',
      charityId: draft.charityId,
      enabled: draft.enabled,
      timezone: habit.timezone || null,
    };
    const res = await api.alcohol.zinc.api.vHabitUpdate({ version: '1.0', userId, id: habit.habitId }, payload);
    await res.match({
      ok: async () => {
        await router.replace('/app');
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/update',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyUpdate(false);
  };

  const errs = validateDraft(draft);

  return (
    <>
      <Head>
        <title>LazyTax — Edit Habit</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Edit Habit</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Update your habit and optional stake.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/app">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-blue-200/60 dark:border-blue-300/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Edit your habit ✏️</CardTitle>
            <CardDescription className="text-xs">Update what you'll do and your stake</CardDescription>
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
              charities={charityOptions.map(c => ({ id: c.id!, label: c.name || c.id! }))}
              errors={errs}
              submitted={submitted}
              onOpenStake={openStakeModal}
              onClearStake={() => setDraft(d => ({ ...d, amount: '' }))}
            />

            <div className="pt-1">
              <Button
                onClick={handleUpdate}
                disabled={loading || Object.keys(errs).length > 0 || busyUpdate}
                className="relative w-full h-12 text-base bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white"
              >
                <Spinner
                  className={`absolute left-3 transition-opacity ${busyUpdate ? 'opacity-100' : 'opacity-0'}`}
                  size="sm"
                />
                <span className={`${busyUpdate ? 'opacity-70' : ''}`}>Update Habit</span>
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
  async (context: GetServerSidePropsContext, { apiTree }): Promise<GetServerSidePropsResult<EditHabitPageProps>> => {
    const { id } = context.params as { id: string };

    // Get userId first
    const userIdResult = await apiTree.alcohol.zinc.api.vUserMeList({ version: '1.0' }, { format: 'text' });

    const result: Result<EditHabitPageData, Problem> = await userIdResult.andThen(async userId => {
      // Fetch habit details
      const habitResult = await apiTree.alcohol.zinc.api.vHabitDetail2({ version: '1.0', userId, id });

      return habitResult.andThen(habit => {
        // Fetch charities and config in parallel
        return apiTree.alcohol.zinc.api.vCharityList({ version: '1.0' }).then(charitiesResult =>
          charitiesResult.andThen(charities =>
            apiTree.alcohol.zinc.api.vConfigurationMeList({ version: '1.0' }).then(configResult =>
              configResult.map(config => ({
                habit,
                charities,
                defaultCharityId: config.principal.defaultCharityId || null,
                timezone: config.principal.timezone || null,
              })),
            ),
          ),
        );
      });
    });

    const initial = await result.serial();

    return {
      props: {
        initial,
      },
    };
  },
);
