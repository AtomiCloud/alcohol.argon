import { useEffect, useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharityPrincipalRes, UpdateConfigurationReq, ConfigurationRes } from '@/clients/alcohol/zinc/api';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { Spinner } from '@/components/ui/spinner';
import type { ResultSerial } from '@/lib/monads/result';
import { Res, Ok, Err, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { Settings, Heart, Clock } from 'lucide-react';
import CharityComboBox from '@/components/app/CharityComboBox';
import TimezoneComboBox from '@/components/app/TimezoneComboBox';
import { getTimezoneOptions } from '@/lib/utility/timezones';

type SettingsPageData = {
  charities: CharityPrincipalRes[];
  configuration: ConfigurationRes;
};
type SettingsPageProps = { initial: ResultSerial<SettingsPageData, Problem> };

export default function SettingsPage({ initial }: SettingsPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const router = useRouter();

  const [data] = useState(() => Res.fromSerial<SettingsPageData, Problem>(initial));
  const [charities, setCharities] = useState<CharityPrincipalRes[]>([]);
  const [configuration, setConfiguration] = useState<ConfigurationRes | null>(null);

  const [timezone, setTimezone] = useState<string>('');
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    data.map(d => {
      setCharities(d.charities);
      setConfiguration(d.configuration);
      setTimezone(d.configuration.principal.timezone || 'UTC');
      setSelectedCharityId(d.configuration.principal.defaultCharityId || '');
    });
  }, [data]);

  const charityOptions = useMemo(
    () => charities.filter(c => !!c.id).map(c => ({ id: c.id!, label: c.name || 'Unknown' })),
    [charities],
  );

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  const handleSave = async () => {
    if (!configuration?.principal.id) return;

    setSubmitting(true);
    const payload: UpdateConfigurationReq = {
      timezone,
      defaultCharityId: selectedCharityId || null,
    };

    const result = await api.alcohol.zinc.api.vConfigurationUpdate2(
      { version: '1.0', id: configuration.principal.id! },
      payload,
    );

    result.match({
      ok: () => {
        // Success - could show a toast here
        setSubmitting(false);
      },
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'settings/config-update',
          problem,
        });
        setSubmitting(false);
      },
    });
  };

  const hasChanges =
    timezone !== (configuration?.principal.timezone || 'UTC') ||
    selectedCharityId !== (configuration?.principal.defaultCharityId || '');

  return (
    <>
      <Head>
        <title>Settings - LazyTax</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your account preferences and default settings
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Preferences
              </CardTitle>
              <CardDescription>Update your timezone and default charity for habits</CardDescription>
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
                <CharityComboBox options={charityOptions} value={selectedCharityId} onChange={setSelectedCharityId} />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose where your stakes will go when you miss a habit.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || submitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button variant="outline" onClick={() => router.push('/app')} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (context, { apiTree, auth, problemRegistry }): Promise<GetServerSidePropsResult<SettingsPageProps>> => {
    // Get configuration ID from access token
    const tokenSetResult = await auth.retriever.getTokenSet();

    const result: Result<GetServerSidePropsResult<SettingsPageProps>, Problem> = await tokenSetResult.andThen(
      async tokenState => {
        if (!tokenState.value.isAuthed) {
          return Err<GetServerSidePropsResult<SettingsPageProps>, Problem>(
            problemRegistry.createProblem('unauthorized', {}),
          );
        }

        const accessToken = tokenState.value.data.accessTokens['alcohol-zinc'];
        const claims = auth.checker.toToken(accessToken) as Record<string, unknown>;
        const configId = claims.configuration_id as string | undefined;

        if (!configId) {
          // No config ID, redirect to onboarding
          return Ok<GetServerSidePropsResult<SettingsPageProps>, Problem>({
            redirect: {
              permanent: false,
              destination: '/onboarding',
            },
          });
        }

        const [charitiesResult, configResult] = await Promise.all([
          apiTree.alcohol.zinc.api.vCharityList({ version: '1.0' }),
          apiTree.alcohol.zinc.api.vConfigurationDetail2({ version: '1.0', id: configId }),
        ]);

        // Combine results
        return charitiesResult.andThen(charities =>
          configResult.map(configuration => ({
            props: {
              initial: ['ok', { charities, configuration }] as ResultSerial<SettingsPageData, Problem>,
            },
          })),
        );
      },
    );

    return result.match({
      ok: result => result,
      err: problem => ({
        props: {
          initial: ['err', problem] as ResultSerial<SettingsPageData, Problem>,
        },
      }),
    });
  },
);
