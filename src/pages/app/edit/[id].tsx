import { useMemo, useState } from 'react';
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
import type {
  CharityPrincipalRes,
  ConfigurationRes,
  HabitVersionRes,
  UpdateHabitReq,
} from '@/clients/alcohol/zinc/api';
import StakeSheet from '@/components/app/StakeSheet';
import ConsentConfirmModal from '@/components/app/ConsentConfirmModal';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { Save, X } from 'lucide-react';
import type { ResultSerial } from '@/lib/monads/result';
import { Res, Err, Ok, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import HabitEditorCard from '@/components/app/HabitEditorCard';
import type { HabitDraft } from '@/models/habit';
import { toHHMMSS, toHM, validateHabitDraft } from '@/lib/utility/habit-utils';
import { useEnhancedFormUrlState } from '@/lib/urlstate/useEnhancedFormUrlState';
import { useClaims } from '@/lib/auth/providers';
import { useStakeFlow } from '@/lib/payment/use-stake-flow';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';

type EditHabitPageData = {
  habit: HabitVersionRes;
  charity: CharityPrincipalRes;
};
type EditHabitPageProps = { initial: ResultSerial<EditHabitPageData, Problem> };

export default function EditHabitPage({ initial }: EditHabitPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();
  const router = useRouter();
  const [claimsResult, claimsContent] = useClaims();

  // Deserialize SSR data using useContent pattern
  const [dataResult] = useState(() => Res.fromSerial<EditHabitPageData, Problem>(initial));
  const [, loader] = useFreeLoader();
  const data = useContent(dataResult, { loader, notFound: 'Habit not found' });

  // Enhanced form state with dual sync strategies
  // router.query is the source of truth (SSR guarantees all params are present)
  const { state, updateField, updateFieldImmediate } = useEnhancedFormUrlState({
    task: '',
    days: '[]',
    time: '',
    amount: '',
    charity: '',
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
    currentAmount: state.amount,
    onAmountChange: amount => updateFieldImmediate({ amount }),
    formState: {
      task: state.task || '',
      days: state.days,
      time: state.time || '',
      charity: state.charity || '',
    },
    returnPath: `/app/edit/${habitId}`,
  });

  const handleUpdate = async () => {
    if (!data?.habit.habitId) return;
    setSubmitted(true);
    const errs = validateHabitDraft(draft);
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
      timezone: data.habit.timezone || null,
    };
    const res = await api.alcohol.zinc.api.vHabitUpdate({ version: '1.0', userId, id: data.habit.habitId }, payload);
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

  // Validate draft and early return if data not loaded
  const errs = validateHabitDraft(draft);
  if (!data) return null;

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
              charity={data.charity}
              onChange={d => setDraft(prev => ({ ...prev, ...d }))}
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
    const api = apiTree.alcohol.zinc.api;

    // Get userId first
    const userIdResult = await api.vUserMeList({ version: '1.0' }, { format: 'text' });

    const result = userIdResult.andThen(async (userId: string) => {
      // Fetch habit and config first
      const habitResult = await api.vHabitDetail2({ version: '1.0', userId, id });
      const configResult = await api.vConfigurationMeList({ version: '1.0' });

      return configResult.andThen(async config => {
        return habitResult.andThen(async habit => {
          // Check for missing query params and populate with defaults
          const query = context.query;
          const task = (query.task as string) || habit.task || '';
          const days = (query.days as string) || JSON.stringify(habit.daysOfWeek || []);
          const time = (query.time as string) || toHM(habit.notificationTime || '');
          const amount = (query.amount as string) || (habit.stake ? String(habit.stake) : '');
          const charity = (query.charity as string) || habit.charityId || config.principal.defaultCharityId || '';

          // If any required params are missing, redirect with all params populated
          if (!query.task || !query.days || !query.time || !query.amount || !query.charity) {
            return Err<EditHabitPageData, Problem>({
              type: 'redirect',
              title: 'Redirect needed',
              status: 302,
              detail: `/app/edit/${id}?task=${encodeURIComponent(task)}&days=${encodeURIComponent(days)}&time=${encodeURIComponent(time)}&amount=${encodeURIComponent(amount)}&charity=${encodeURIComponent(charity)}`,
            });
          }

          // All params are present, fetch charity and return data
          return (await api.vCharityDetail({ version: '1.0', id: charity })).map(({ principal }) => ({
            habit,
            charity: principal,
          }));
        });
      });
    });

    const initial: ResultSerial<EditHabitPageData, Problem> = await result.serial();

    // Check if we need to redirect
    if (initial[0] === 'err' && initial[1].type === 'redirect') {
      return {
        redirect: {
          destination: initial[1].detail || `/app/edit/${id}`,
          permanent: false,
        },
      };
    }

    return { props: { initial } };
  },
);
