import { useCallback, useMemo, useState } from 'react';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { AsyncButton } from '@/components/ui/async-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, HabitVersionRes, UpdateHabitReq } from '@/clients/alcohol/zinc/api';
import StakeSheet from '@/components/app/StakeSheet';
import ConsentConfirmModal from '@/components/app/ConsentConfirmModal';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { X, Save } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { ResultSerial } from '@/lib/monads/result';
import type { Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import HabitEditorCard from '@/components/app/HabitEditorCard';
import type { HabitDraft } from '@/models/habit';
import { toHHMMSS, toHM } from '@/lib/utility/habit-utils';
import { normalizeDecimalString } from '@/lib/utility/money-utils';
import { useFormUrlState } from '@/lib/urlstate/useFormUrlState';
import { useClaims } from '@/lib/auth/providers';
import { useStakeFlow } from '@/lib/payment/use-stake-flow';

type EditHabitPageData = {
  habit: HabitVersionRes;
  charities: CharityPrincipalRes[];
  defaultCharityId: string | null;
  timezone: string | null;
};
type EditHabitPageProps = { initial: ResultSerial<EditHabitPageData, Problem> };

export default function EditHabitPage({ initial }: EditHabitPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();
  const [claimsResult, claimsContent] = useClaims();

  // Extract server data synchronously from serialized initial prop
  const initialData: EditHabitPageData =
    initial[0] === 'ok'
      ? initial[1]
      : { habit: {} as HabitVersionRes, charities: [], defaultCharityId: null, timezone: null };

  const habit = initialData.habit;
  const charityOptions = useMemo(() => initialData.charities.filter(c => !!c.id), [initialData.charities]);

  // Unified form state with URL sync (batched updates prevent navigation loops)
  const { state: formState, updateFields } = useFormUrlState({
    task: habit.task || '',
    days: JSON.stringify(habit.daysOfWeek || []),
    time: toHM(habit.notificationTime || ''),
    amount: habit.stake ? String(habit.stake) : '',
    charity: habit.charityId || '',
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
  const [busyUpdate, setBusyUpdate] = useState(false);

  // Get habitId from router
  const habitId = router.query.id as string;

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
    returnPath: `/app/edit/${habitId}`,
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

  const handleUpdate = async () => {
    if (!habit?.habitId) return;
    setSubmitted(true);
    const errs = validateDraft(draft);
    if (Object.keys(errs).length > 0) return;
    setBusyUpdate(true);

    // Get userId from claims (no API call needed)
    if (claimsResult === 'err') {
      setBusyUpdate(false);
      return;
    }
    const [hasData, authState] = claimsContent;
    if (!hasData) {
      setBusyUpdate(false);
      return;
    }

    // Check if user is authenticated
    if (authState.__kind !== 'authed') {
      setBusyUpdate(false);
      return;
    }

    const userId = authState.value.data.sub;

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
              <AsyncButton
                onClick={handleUpdate}
                disabled={Object.keys(errs).length > 0}
                loading={busyUpdate}
                className="relative w-full h-12 text-base bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white"
                idleIcon={<Save className="w-4 h-4" />}
              >
                Update Habit
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
  async (context: GetServerSidePropsContext, { apiTree }): Promise<GetServerSidePropsResult<EditHabitPageProps>> => {
    const { id } = context.params as { id: string };

    const zinc = apiTree.alcohol.zinc.api;
    // Get userId first
    const userIdResult = await zinc.vUserMeList({ version: '1.0' }, { format: 'text' });

    const result: Result<EditHabitPageData, Problem> = userIdResult.andThen(async userId => {
      // Fetch habit details
      const habitResult = await zinc.vHabitDetail2({ version: '1.0', userId, id });
      return habitResult.andThen(async habit => {
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
