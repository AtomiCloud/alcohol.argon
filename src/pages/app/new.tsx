import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Res, Ok, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import HabitEditorCard from '@/components/app/HabitEditorCard';
import { defaultHabitDraft, type HabitDraft, WEEKDAY_ORDER } from '@/models/habit';
import { amountToCents, formatCentsToAmount, toHHMMSS } from '@/lib/utility/habit-utils';
import { normalizeDecimalString } from '@/lib/utility/money-utils';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { useFormUrlState } from '@/lib/urlstate/useFormUrlState';
import { useClaims } from '@/lib/auth/providers';

type NewHabitPageData = {
  charities: CharityPrincipalRes[];
  defaultCharityId: string | null;
  timezone: string | null;
};
type NewHabitPageProps = { initial: ResultSerial<NewHabitPageData, Problem> };

export default function NewHabitPage({ initial }: NewHabitPageProps) {
  const api = useSwaggerClients();
  const [loading, loader] = useFreeLoader();
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

  // Advanced controls are handled inside HabitEditorCard
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeBuffer, setStakeBuffer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busyCreate, setBusyCreate] = useState(false);

  // Payment consent hook
  const { checking: checkingPayment, checkAndInitiatePayment, pollPaymentConsent } = usePaymentConsent();
  const [pollingPayment, setPollingPayment] = useState(false);

  // Check for payment status on mount (after HPP redirect)
  // biome-ignore lint/correctness/useExhaustiveDependencies: router and pollPaymentConsent cause infinite loop
  useEffect(() => {
    const paymentStatus = router.query.payment_status;
    if (paymentStatus === 'success') {
      setPollingPayment(true);
      pollPaymentConsent(
        () => {
          setPollingPayment(false);
          // Clean up URL
          router.replace('/app/new', undefined, { shallow: true });
        },
        () => {
          setPollingPayment(false);
          alert('Payment consent setup failed or timed out. Please try again.');
          router.replace('/app/new', undefined, { shallow: true });
        },
      );
    } else if (paymentStatus === 'failed') {
      alert('Payment consent setup failed. Please try again.');
      router.replace('/app/new', undefined, { shallow: true });
    }
  }, [router.query.payment_status]);

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

  const confirmStakeModal = async () => {
    const val = formatCentsToAmount(stakeBuffer);

    // Check if amount is non-zero and if user needs payment consent
    if (Number(val) > 0) {
      try {
        // Build return URL with all current form state
        const returnParams = new URLSearchParams({
          task: task || '',
          days: JSON.stringify(daysOfWeek),
          time: notificationTime || '',
          amount: val,
          charity: charityId || '',
        });
        const returnUrl = `/app/new?${returnParams.toString()}`;

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
