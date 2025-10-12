import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { HabitDraft } from '@/models/habit';
import { amountToCents, formatCentsToAmount, toHHMMSS, toHM } from '@/lib/utility/habit-utils';
import { normalizeDecimalString } from '@/lib/utility/money-utils';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { useFormUrlState } from '@/lib/urlstate/useFormUrlState';
import { useClaims } from '@/lib/auth/providers';

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
  const [claimsResult, claimsContent] = useClaims();

  // Extract server data synchronously from serialized initial prop
  const initialData: EditHabitPageData =
    initial[0] === 'ok'
      ? initial[1]
      : { habit: {} as HabitVersionRes, charities: [], defaultCharityId: null, timezone: null };

  const habit = initialData.habit;
  const charityOptions = useMemo(() => initialData.charities.filter(c => !!c.id), [initialData.charities]);
  const timezone = initialData.timezone || habit.timezone || 'UTC';

  // Keep Result monad version for error handling
  const [data] = useState(() => Res.fromSerial<EditHabitPageData, Problem>(initial));

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

  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeBuffer, setStakeBuffer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busyUpdate, setBusyUpdate] = useState(false);

  // Payment consent hook
  const { checking: checkingPayment, checkAndInitiatePayment, pollPaymentConsent } = usePaymentConsent();
  const [pollingPayment, setPollingPayment] = useState(false);

  // Check for payment status on mount (after HPP redirect)
  // biome-ignore lint/correctness/useExhaustiveDependencies: router and pollPaymentConsent cause infinite loop
  useEffect(() => {
    const paymentStatus = router.query.payment_status;
    const habitId = router.query.id as string;

    if (paymentStatus === 'success') {
      setPollingPayment(true);
      pollPaymentConsent(
        () => {
          setPollingPayment(false);
          // Clean up URL
          router.replace(`/app/edit/${habitId}`, undefined, { shallow: true });
        },
        () => {
          setPollingPayment(false);
          alert('Payment consent setup failed or timed out. Please try again.');
          router.replace(`/app/edit/${habitId}`, undefined, { shallow: true });
        },
      );
    } else if (paymentStatus === 'failed') {
      alert('Payment consent setup failed. Please try again.');
      router.replace(`/app/edit/${habitId}`, undefined, { shallow: true });
    }
  }, [router.query.payment_status, router.query.id]);

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

  const confirmStakeModal = async () => {
    const val = formatCentsToAmount(stakeBuffer);

    // Check if amount is non-zero and if user needs payment consent
    if (Number(val) > 0) {
      try {
        // Build return URL with all current form state
        const habitId = router.query.id as string;
        const returnParams = new URLSearchParams({
          task: task || '',
          days: JSON.stringify(daysOfWeek),
          time: notificationTime || '',
          amount: val,
          charity: charityId || '',
        });
        const returnUrl = `/app/edit/${habitId}?${returnParams.toString()}`;

        await checkAndInitiatePayment(() => {
          // Has consent - proceed
          setAmount(val);
          setStakeModalOpen(false);
        }, returnUrl);
      } catch (error) {
        console.error('Payment consent error:', error);
        alert('Failed to initiate payment consent. Please try again.');
      }
    } else {
      // Zero amount - no consent needed
      setAmount(val);
      setStakeModalOpen(false);
    }
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

      {/* Show polling indicator */}
      {pollingPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="p-6 max-w-sm">
            <CardContent className="space-y-4 text-center">
              <Spinner size="lg" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Setting up payment consent... This may take up to a minute.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
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
