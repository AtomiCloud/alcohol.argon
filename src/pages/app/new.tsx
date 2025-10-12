import { useCallback, useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import AsyncButton from '@/components/ui/async-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, CreateHabitReq } from '@/clients/alcohol/zinc/api';
import StakeSheet from '@/components/app/StakeSheet';
import ConsentConfirmModal from '@/components/app/ConsentConfirmModal';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { X, PlusCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { ResultSerial } from '@/lib/monads/result';
import { Res } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import HabitEditorCard from '@/components/app/HabitEditorCard';
import { type HabitDraft, WEEKDAY_ORDER } from '@/models/habit';
import { toHHMMSS } from '@/lib/utility/habit-utils';
import { normalizeDecimalString } from '@/lib/utility/money-utils';
import { useFormUrlState } from '@/lib/urlstate/useFormUrlState';
import { useClaims } from '@/lib/auth/providers';
import { useStakeFlow } from '@/lib/payment/use-stake-flow';

type NewHabitPageData = {
  charities: CharityPrincipalRes[];
  defaultCharityId: string | null;
  timezone: string | null;
};
type NewHabitPageProps = { initial: ResultSerial<NewHabitPageData, Problem> };

export default function NewHabitPage({ initial }: NewHabitPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();
  const [claimsResult, claimsContent] = useClaims();

  // Extract server data synchronously from serialized initial prop
  const initialData: NewHabitPageData =
    initial[0] === 'ok' ? initial[1] : { charities: [], defaultCharityId: null, timezone: null };

  const charityOptions = useMemo(() => initialData.charities.filter(c => !!c.id), [initialData.charities]);
  const timezone = initialData.timezone || 'UTC';

  // Determine initial charity ID for URL defaults
  const initialCharityId = initialData.defaultCharityId || charityOptions[0]?.id || '';

  // Keep Result monad version for error handling
  const [data] = useState(() => Res.fromSerial<NewHabitPageData, Problem>(initial));

  // Unified form state with URL sync (batched updates prevent navigation loops)
  const { state: formState, updateFields } = useFormUrlState({
    task: '',
    days: JSON.stringify(WEEKDAY_ORDER),
    time: '22:00',
    amount: '',
    charity: initialCharityId,
  });

  // Convenience accessors
  const task = formState.task;
  const daysOfWeekRaw = formState.days;
  const notificationTime = formState.time;
  const amount = formState.amount;
  const charityId = formState.charity;

  // Convenience setters (wrap updateFields)
  const setTask = useCallback((value: string) => updateFields({ task: value }), [updateFields]);
  const setDaysOfWeekRaw = useCallback((value: string) => updateFields({ days: value }), [updateFields]);
  const setNotificationTime = useCallback((value: string) => updateFields({ time: value }), [updateFields]);
  const setAmount = useCallback((value: string) => updateFields({ amount: value }), [updateFields]);
  const setCharityId = useCallback((value: string) => updateFields({ charity: value }), [updateFields]);

  // Parse daysOfWeek from JSON string
  const daysOfWeek: string[] = useMemo(() => {
    try {
      return JSON.parse(daysOfWeekRaw);
    } catch {
      return [];
    }
  }, [daysOfWeekRaw]);

  const setDaysOfWeek = useCallback(
    (days: string[]) => {
      setDaysOfWeekRaw(JSON.stringify(days));
    },
    [setDaysOfWeekRaw],
  );

  const draft: HabitDraft = {
    task,
    daysOfWeek,
    notificationTime,
    amount,
    currency: 'USD',
    charityId,
    enabled: true,
  };

  const setDraft = (updater: (prev: HabitDraft) => HabitDraft) => {
    const updated = updater(draft);
    setTask(updated.task);
    setDaysOfWeek(updated.daysOfWeek);
    setNotificationTime(updated.notificationTime);
    setAmount(updated.amount);
    setCharityId(updated.charityId);
  };

  const [submitted, setSubmitted] = useState(false);
  const [busyCreate, setBusyCreate] = useState(false);

  // Stake flow hook (handles payment consent)
  const {
    stakeModalOpen,
    stakeBuffer,
    openStakeModal,
    closeStakeModal,
    keypadAppend,
    setQuickAmount,
    clearBuffer,
    confirmStake,
    checking,
    showConsentConfirm,
    startConsentFlow,
    cancelConsent,
  } = useStakeFlow({
    currentAmount: amount,
    onAmountChange: setAmount,
    formState: {
      task: task || '',
      days: JSON.stringify(daysOfWeek),
      time: notificationTime || '',
      charity: charityId || '',
    },
    returnPath: '/app/new',
  });

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

  const handleCreate = async () => {
    setSubmitted(true);
    const errs = validateDraft(draft);
    if (Object.keys(errs).length > 0) return;
    setBusyCreate(true);

    // Get userId from claims (no API call needed)
    if (claimsResult === 'err') {
      setBusyCreate(false);
      return;
    }
    const [hasData, authState] = claimsContent;
    if (!hasData) {
      setBusyCreate(false);
      return;
    }

    // Check if user is authenticated
    if (authState.__kind !== 'authed') {
      setBusyCreate(false);
      return;
    }

    const userId = authState.value.data.sub;

    const hasStake = draft.amount && Number(draft.amount) > 0;
    const payload: CreateHabitReq = {
      task: draft.task || null,
      daysOfWeek: draft.daysOfWeek.length ? draft.daysOfWeek : [],
      notificationTime: toHHMMSS(draft.notificationTime),
      stake: hasStake ? `${draft.amount}` : '0',
      charityId: draft.charityId,
      timezone: timezone,
    };
    const res = await api.alcohol.zinc.api.vHabitCreate({ version: '1.0', userId }, payload);
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
              charities={charityOptions.map(c => ({ id: c.id!, label: c.name || c.id! }))}
              errors={errs}
              submitted={submitted}
              onOpenStake={openStakeModal}
              onClearStake={() => setDraft(d => ({ ...d, amount: '' }))}
            />

            <div className="pt-1">
              <AsyncButton
                onClick={handleCreate}
                disabled={Object.keys(errs).length > 0}
                loading={busyCreate}
                className="relative w-full h-12 text-base bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 text-white"
                idleIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create Habit
              </AsyncButton>
            </div>
          </CardContent>
        </Card>
      </div>

      <StakeSheet
        open={stakeModalOpen}
        amountCents={stakeBuffer}
        onAppend={keypadAppend}
        onQuick={setQuickAmount}
        onClear={clearBuffer}
        onClose={closeStakeModal}
        onConfirm={confirmStake}
      />

      <ConsentConfirmModal
        open={showConsentConfirm}
        onCancel={cancelConsent}
        onConfirm={startConsentFlow}
        loading={checking}
      />
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (_, { apiTree }): Promise<GetServerSidePropsResult<NewHabitPageProps>> => {
    const charitiesResult = await apiTree.alcohol.zinc.api.vCharityList({ version: '1.0' });
    const configResult = await apiTree.alcohol.zinc.api.vConfigurationMeList({ version: '1.0' });

    const result = charitiesResult.andThen(charities =>
      configResult.map(config => ({
        charities,
        defaultCharityId: config.principal.defaultCharityId || null,
        timezone: config.principal.timezone || null,
      })),
    );

    const initial = await result.serial();

    return {
      props: {
        initial,
      },
    };
  },
);
