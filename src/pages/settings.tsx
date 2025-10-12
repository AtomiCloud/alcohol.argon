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
import type { CharityPrincipalRes, UpdateConfigurationReq, ConfigurationRes } from '@/clients/alcohol/zinc/api';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { ResultSerial } from '@/lib/monads/result';
import { Res, Ok, Err, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { Settings } from 'lucide-react';
import CharityComboBox from '@/components/app/CharityComboBox';
import TimezoneComboBox from '@/components/app/TimezoneComboBox';
import { getTimezoneOptions } from '@/lib/utility/timezones';
import { FieldCard } from '@/components/ui/field-card';

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
  const [awaitingSync, setAwaitingSync] = useState<null | { tz: string; charityId: string }>(null);

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
        // Begin polling until server reflects the new settings
        setAwaitingSync({ tz: timezone, charityId: selectedCharityId || '' });
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

  const hasChanges = useMemo(() => {
    return (
      timezone !== (configuration?.principal.timezone || 'UTC') ||
      selectedCharityId !== (configuration?.principal.defaultCharityId || '')
    );
  }, [timezone, selectedCharityId, configuration?.principal.timezone, configuration?.principal.defaultCharityId]);

  // Poll for server-side configuration sync after saving
  useEffect(() => {
    if (!awaitingSync || !configuration?.principal.id) return;
    let attempts = 0;
    let cancelled = false;
    const id = configuration.principal.id;

    const checkOnce = async () => {
      const res = await api.alcohol.zinc.api.vConfigurationDetail2({ version: '1.0', id });
      res.match({
        ok: cfg => {
          if (cancelled) return;
          setConfiguration(cfg);
          const match =
            (cfg.principal.timezone || 'UTC') === awaitingSync.tz &&
            (cfg.principal.defaultCharityId || '') === awaitingSync.charityId;
          if (match) {
            setAwaitingSync(null);
            setSubmitting(false);
          }
        },
        err: () => {
          // ignore and keep polling up to a limit
        },
      });
    };

    const interval = setInterval(async () => {
      attempts += 1;
      await checkOnce();
      if (attempts >= 10) {
        clearInterval(interval);
        setSubmitting(false);
        setAwaitingSync(null);
      }
    }, 1000);

    // kick off an immediate check
    checkOnce();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [awaitingSync, configuration?.principal.id, api]);

  return (
    <>
      <Head>
        <title>Settings - LazyTax</title>
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FieldCard
            label="Timezone"
            subtitle="We use this to send reminders at the right time"
            restriction="Pick the region closest to you"
            contentClassName="space-y-2"
          >
            <TimezoneComboBox options={timezoneOptions} value={timezone} onChange={setTimezone} />
          </FieldCard>

          <FieldCard
            label="Default Charity"
            subtitle="Where your stakes will go when you miss a habit"
            restriction="You can change this anytime"
            contentClassName="space-y-2"
          >
            <CharityComboBox options={charityOptions} value={selectedCharityId} onChange={setSelectedCharityId} />
          </FieldCard>
        </div>

        <div className="mt-6 flex gap-3">
          <AsyncButton
            onClick={handleSave}
            disabled={!hasChanges}
            loading={submitting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            idleIcon={<Settings className="w-4 h-4" />}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </AsyncButton>
          <Button variant="outline" onClick={() => router.push('/app')} disabled={submitting}>
            Cancel
          </Button>
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
