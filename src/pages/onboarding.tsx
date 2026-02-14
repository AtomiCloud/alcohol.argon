import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { AsyncButton } from '@/components/ui/async-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, CreateConfigurationReq } from '@/clients/alcohol/zinc/api';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { ResultSerial } from '@/lib/monads/result';
import { Res } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { Heart, Settings } from 'lucide-react';
import CharitySelector from '@/components/app/CharitySelector';
import TimezoneComboBox from '@/components/app/TimezoneComboBox';
import { getTimezoneOptions } from '@/lib/utility/timezones';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { TrackingEvents } from '@/lib/events';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useEnhancedFormUrlState } from '@/lib/urlstate/useEnhancedFormUrlState';
import { getClientTimezone } from '@/lib/utility/timezone-detection';

type OnboardingPageData = {
  charity: CharityPrincipalRes;
};

type OnboardingPageProps = {
  initial: ResultSerial<OnboardingPageData, Problem>;
};

export default function OnboardingPage({ initial }: OnboardingPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const router = useRouter();
  const track = usePlausible();

  // Deserialize SSR data using useContent pattern
  const [dataResult] = useState(() => Res.fromSerial<OnboardingPageData, Problem>(initial));
  const [, loader] = useFreeLoader();
  const data = useContent(dataResult, { loader, notFound: 'Charity not found' });

  // Enhanced form state with dual sync strategies
  // router.query is the source of truth, but use client-detected timezone as default
  const { state, updateFieldImmediate } = useEnhancedFormUrlState({
    tz: getClientTimezone(),
    charityId: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Track page view
  useEffect(() => track(TrackingEvents.Onboarding.PageViewed), [track]);

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  const handleSubmit = async () => {
    if (!state.tz || !state.charityId) return;

    track(TrackingEvents.Onboarding.Submit.Clicked);
    setSubmitting(true);
    const payload: CreateConfigurationReq = {
      timezone: state.tz,
      defaultCharityId: state.charityId,
    };

    const result = await api.alcohol.zinc.api.vConfigurationCreate2({ version: '1.0' }, payload);

    result.match({
      ok: async () => {
        track(TrackingEvents.Onboarding.Submit.Success);
        // After creating config, refresh tokens so access token claims include configuration_id
        try {
          await fetch('/api/auth/force_tokens');
          // small delay to allow upstream claim propagation
          await new Promise(res => setTimeout(res, 150));
        } catch {
          // best-effort; proceed regardless
        }
        // Redirect to app page after successful onboarding
        router.replace('/app');
      },
      err: problem => {
        track(TrackingEvents.Onboarding.Submit.Error);
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'onboarding/config-create',
          problem,
        });
        setSubmitting(false);
      },
    });
  };

  const handleTimezoneChange = useCallback(
    (tz: string) => {
      track(TrackingEvents.Onboarding.TimezoneSelected);
      updateFieldImmediate({ tz });
    },
    [track, updateFieldImmediate],
  );

  const canSubmit = state.tz.length > 0 && state.charityId.length > 0;

  // Guard check after hooks
  if (!data) return null;

  return (
    <>
      <Head>
        <title>Welcome - LazyTax</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-lg">
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-6">
                <div className="flex justify-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Welcome to LazyTax!
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Let's set up your account. We just need a few details to get you started.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Timezone */}
                <div className="space-y-2">
                  <label htmlFor="timezone-combobox" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Timezone
                  </label>
                  <TimezoneComboBox options={timezoneOptions} value={state.tz} onChange={handleTimezoneChange} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This helps us send you reminders at the right time.
                  </p>
                </div>

                {/* Default Charity */}
                <div className="space-y-2">
                  <label
                    htmlFor="charity"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Default Charity
                  </label>
                  <CharitySelector charity={data.charity} returnCharityParam="charityId" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose where your stakes will go when you miss a habit.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <AsyncButton
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    loading={submitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    size="lg"
                    idleIcon={<Settings className="w-4 h-4" />}
                  >
                    {submitting ? 'Setting up...' : 'Complete Setup'}
                  </AsyncButton>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can change these settings later in your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'public' },
  async (context, { apiTree, config }): Promise<GetServerSidePropsResult<OnboardingPageProps>> => {
    const api = apiTree.alcohol.zinc.api;
    const defaultCharityId = config.common.onboarding.defaultCharityId;

    // Check for missing query params and populate with defaults
    const query = context.query;
    // For timezone, we let the client handle detection, so we don't require it in SSR
    const charityId = (query.charityId as string) || defaultCharityId;

    // If charityId is missing, redirect with it populated
    // Note: We don't require tz param - client will detect it
    if (!query.charityId) {
      return {
        redirect: {
          destination: `/onboarding?charityId=${encodeURIComponent(charityId)}`,
          permanent: false,
        },
      };
    }

    // All params are present, fetch charity and return data
    const result = await api.vCharityDetail({ version: '1.0', id: charityId });

    const initial: ResultSerial<OnboardingPageData, Problem> = await result
      .map(({ principal }) => ({
        charity: principal,
      }))
      .serial();

    return { props: { initial } };
  },
);
