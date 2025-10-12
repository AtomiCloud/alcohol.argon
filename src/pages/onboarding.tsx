import { useEffect, useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { AsyncButton } from '@/components/ui/async-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, CreateConfigurationReq } from '@/clients/alcohol/zinc/api';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { Spinner } from '@/components/ui/spinner';
import type { ResultSerial } from '@/lib/monads/result';
import { Res, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { Settings, Heart, ArrowRight } from 'lucide-react';
import CharityComboBox from '@/components/app/CharityComboBox';
import TimezoneComboBox from '@/components/app/TimezoneComboBox';
import { getTimezoneOptions } from '@/lib/utility/timezones';

type OnboardingPageData = {
  charities: CharityPrincipalRes[];
};
type OnboardingPageProps = { initial: ResultSerial<OnboardingPageData, Problem> };

export default function OnboardingPage({ initial }: OnboardingPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const router = useRouter();

  const [data] = useState(() => Res.fromSerial<OnboardingPageData, Problem>(initial));
  const [charities, setCharities] = useState<CharityPrincipalRes[]>([]);
  const [clientTimezone, setClientTimezone] = useState<string>('UTC');

  const [timezone, setTimezone] = useState<string>('');
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Detect client timezone on mount and prefill
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setClientTimezone(tz);
        setTimezone(tz);
      }
    } catch {
      setClientTimezone('UTC');
      setTimezone('UTC');
    }
  }, []);

  useEffect(() => {
    data.map(d => {
      setCharities(d.charities);
    });
  }, [data]);

  const charityOptions = useMemo(
    () => charities.filter(c => !!c.id).map(c => ({ id: c.id!, label: c.name || 'Unknown' })),
    [charities],
  );

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  useEffect(() => {
    if (!selectedCharityId && charityOptions.length > 0) {
      setSelectedCharityId(charityOptions[0].id);
    }
  }, [charityOptions, selectedCharityId]);

  const handleSubmit = async () => {
    if (!timezone || !selectedCharityId) return;

    setSubmitting(true);
    const payload: CreateConfigurationReq = {
      timezone,
      defaultCharityId: selectedCharityId,
    };

    const result = await api.alcohol.zinc.api.vConfigurationCreate2({ version: '1.0' }, payload);

    result.match({
      ok: async () => {
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
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'onboarding/config-create',
          problem,
        });
        setSubmitting(false);
      },
    });
  };

  const canSubmit = timezone.length > 0 && selectedCharityId.length > 0;

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
                  <TimezoneComboBox options={timezoneOptions} value={timezone} onChange={setTimezone} />
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
                  <div className="border border-input rounded-lg p-3 bg-background">
                    <CharityComboBox
                      options={charityOptions}
                      value={selectedCharityId}
                      onChange={setSelectedCharityId}
                    />
                  </div>
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
  async (context, { apiTree }): Promise<GetServerSidePropsResult<OnboardingPageProps>> => {
    const charitiesResult = await apiTree.alcohol.zinc.api.vCharityList({ version: '1.0' });

    return charitiesResult.match({
      ok: charities => ({
        props: {
          initial: ['ok', { charities }] as ResultSerial<OnboardingPageData, Problem>,
        },
      }),
      err: problem => ({
        props: {
          initial: ['err', problem] as ResultSerial<OnboardingPageData, Problem>,
        },
      }),
    });
  },
);
