import { useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { AsyncButton } from '@/components/ui/async-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, ConfigurationRes, CreateHabitReq } from '@/clients/alcohol/zinc/api';
import StakeSheet from '@/components/app/StakeSheet';
import ConsentConfirmModal from '@/components/app/ConsentConfirmModal';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { PlusCircle, X } from 'lucide-react';
import type { ResultSerial } from '@/lib/monads/result';
import { Err, Res } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import HabitEditorCard from '@/components/app/HabitEditorCard';
import { type HabitDraft, WEEKDAY_ORDER } from '@/models/habit';
import { toHHMMSS, validateHabitDraft } from '@/lib/utility/habit-utils';
import { useEnhancedFormUrlState } from '@/lib/urlstate/useEnhancedFormUrlState';
import { useClaims } from '@/lib/auth/providers';
import { useStakeFlow } from '@/lib/payment/use-stake-flow';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { TrackingEvents } from '@/lib/events';

type NewHabitPageData = {
  charity: CharityPrincipalRes;
  config: ConfigurationRes;
};

type NewHabitPageProps = { initial: ResultSerial<NewHabitPageData, Problem> };

export default function NewHabitPage({ initial }: NewHabitPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();
  const [claimsResult, claimsContent] = useClaims();
  const track = usePlausible();

  // Deserialize SSR data using useContent pattern
  const [dataResult] = useState(() => Res.fromSerial<NewHabitPageData, Problem>(initial));
  const [, loader] = useFreeLoader();
  const data = useContent(dataResult, { loader, notFound: 'Configuration not found' });

  // Enhanced form state with dual sync strategies
  // router.query is the source of truth (SSR guarantees all params are present)
  const { state, updateField, updateFieldImmediate } = useEnhancedFormUrlState({
    task: '',
    days: JSON.stringify(WEEKDAY_ORDER),
    time: '22:00',
    amount: '',
    charity: '',
    tz: '',
  });

  // Parse daysOfWeek from JSON string
  const daysOfWeek: string[] = useMemo(() => {
    try {
      return JSON.parse(state.days);
    } catch {
      return [];
    }
  }, [state.days]);

  const draft: HabitDraft = {
    task: state.task,
    daysOfWeek,
    notificationTime: state.time,
    amount: state.amount,
    currency: 'USD',
    charityId: state.charity,
    enabled: true,
  };

  const setDraft = (updater: (prev: HabitDraft) => HabitDraft) => {
    const updated = updater(draft);
    // Text fields - debounced updates
    updateField({
      task: updated.task,
      days: JSON.stringify(updated.daysOfWeek),
      time: updated.notificationTime,
    });
    // Amount and charity will be handled separately with immediate updates
    if (updated.amount !== state.amount) {
      updateFieldImmediate({ amount: updated.amount });
    }
    if (updated.charityId !== state.charity) {
      updateFieldImmediate({ charity: updated.charityId });
    }
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
    currentAmount: state.amount,
    onAmountChange: amount => updateFieldImmediate({ amount }),
    formState: {
      task: state.task || '',
      days: state.days,
      time: state.time || '',
      charity: state.charity || '',
    },
    returnPath: '/app/new',
  });

  const handleCreate = async () => {
    setSubmitted(true);
    const errs = validateHabitDraft(draft);
    if (Object.keys(errs).length > 0) {
      track(TrackingEvents.NewHabit.Submit.ValidationError);
      return;
    }
    track(TrackingEvents.NewHabit.Submit.Clicked);
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
      timezone: state.tz,
    };
    const res = await api.alcohol.zinc.api.vHabitCreate({ version: '1.0', userId }, payload);
    await res.match({
      ok: async () => {
        track(TrackingEvents.NewHabit.Submit.Success);
        await router.replace('/app?created=1');
      },
      err: problem => {
        track(TrackingEvents.NewHabit.Submit.Error);
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/habits/create',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyCreate(false);
  };

  const handleOpenStake = () => {
    track(TrackingEvents.NewHabit.StakeOpened);
  };

  const handleClearStake = () => {
    track(TrackingEvents.NewHabit.StakeCleared);
    updateFieldImmediate({ amount: '' });
  };

  // Validate draft and early return if data not loaded
  const errs = validateHabitDraft(draft);
  if (!data) return null;

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
              charity={data.charity}
              onChange={d => setDraft(prev => ({ ...prev, ...d }))}
              errors={errs}
              submitted={submitted}
              onOpenStake={() => {
                handleOpenStake();
                openStakeModal();
              }}
              onClearStake={handleClearStake}
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
  async (context, { apiTree }): Promise<GetServerSidePropsResult<NewHabitPageProps>> => {
    const api = apiTree.alcohol.zinc.api;

    // Fetch config first to get defaults
    const configResult = await api.vConfigurationMeList({ version: '1.0' });

    const result = configResult.andThen(async config => {
      // Check for missing query params and populate with defaults
      const query = context.query;
      const days = (query.days as string) || JSON.stringify(WEEKDAY_ORDER);
      const time = (query.time as string) || '22:00';
      const charity = (query.charity as string) || config.principal.defaultCharityId || '';
      const tz = (query.tz as string) || config.principal.timezone || '';
      const task = (query.task as string) || '';
      const amount = (query.amount as string) || '';

      // If any required params are missing, redirect with all params populated
      if (!query.days || !query.time || !query.charity || !query.tz) {
        // We can't redirect from inside the Result chain, so we'll handle this differently
        // Store the redirect info to check later
        return Err<NewHabitPageData, Problem>({
          type: 'redirect',
          title: 'Redirect needed',
          status: 302,
          detail: `/app/new?task=${encodeURIComponent(task)}&days=${encodeURIComponent(days)}&time=${encodeURIComponent(time)}&amount=${encodeURIComponent(amount)}&charity=${encodeURIComponent(charity)}&tz=${encodeURIComponent(tz)}`,
        });
      }

      // All params are present, fetch charity and return data
      return (await api.vCharityDetail({ version: '1.0', id: charity })).map(({ principal }) => ({
        charity: principal,
        config,
      }));
    });

    const initial: ResultSerial<NewHabitPageData, Problem> = await result.serial();

    // Check if we need to redirect
    if (initial[0] === 'err' && initial[1].type === 'redirect') {
      return {
        redirect: {
          destination: initial[1].detail || '/app/new',
          permanent: false,
        },
      };
    }

    return { props: { initial } };
  },
);
