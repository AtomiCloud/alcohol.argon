import { useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AsyncButton } from '@/components/ui/async-button';
import type { CharityPrincipalRes, ConfigurationRes, UpdateConfigurationReq } from '@/clients/alcohol/zinc/api';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { ResultSerial } from '@/lib/monads/result';
import { Err, Res } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { AlertCircle, Settings, ShieldX } from 'lucide-react';
import CharitySelector from '@/components/app/CharitySelector';
import TimezoneComboBox from '@/components/app/TimezoneComboBox';
import { getTimezoneOptions } from '@/lib/utility/timezones';
import { FieldCard } from '@/components/ui/field-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useHasPaymentConsent, useUserId } from '@/lib/auth/use-user';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useEnhancedFormUrlState } from '@/lib/urlstate/useEnhancedFormUrlState';
import { hasTimezoneMismatch } from '@/lib/utility/timezone-detection';
import { Alert, AlertDescription } from '@/components/ui/alert';

type SettingsPageData = {
  configuration: ConfigurationRes;
  charity: CharityPrincipalRes;
};
type SettingsPageProps = { initial: ResultSerial<SettingsPageData, Problem> };

export default function SettingsPage({ initial }: SettingsPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const router = useRouter();
  const userId = useUserId();
  const hasPaymentConsent = useHasPaymentConsent();
  const { checkAndInitiatePayment, checking } = usePaymentConsent();

  // Deserialize SSR data using useContent pattern
  const [dataResult] = useState(() => Res.fromSerial<SettingsPageData, Problem>(initial));
  const [, loader] = useFreeLoader();
  const data = useContent(dataResult, { loader, notFound: 'Settings data not found' });

  // Enhanced form state with dual sync strategies
  // router.query is the source of truth (SSR guarantees all params are present)
  const { state, updateFieldImmediate } = useEnhancedFormUrlState({
    tz: '',
    charity: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [removingConsent, setRemovingConsent] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  // Diff current state vs saved config to enable/disable save button
  const hasChanges = useMemo(() => {
    if (!data) return false;
    return (
      state.tz !== data.configuration.principal.timezone ||
      state.charity !== data.configuration.principal.defaultCharityId
    );
  }, [state, data]);

  // Show timezone mismatch warning
  const tzMismatch = data ? hasTimezoneMismatch(data.configuration.principal.timezone) : null;

  if (!data) return null; // useContent handles loading/error states

  const handleRemoveConsent = async () => {
    if (!userId || !hasPaymentConsent) return;
    try {
      setRemovingConsent(true);
      // Revoke payment consent via Alcohol-Zinc API
      await api.alcohol.zinc.api.vPaymentConsentDelete({ version: '1.0', userId });
      // Force-refresh tokens so claims reflect removal immediately
      await fetch('/api/auth/force_tokens');
      // Reload settings to reflect updated consent state
      await router.replace(router.asPath);
    } catch (error) {
      console.error('Failed to remove payment consent:', error);
      problemReporter.pushError(new Error('Failed to remove payment consent'), {
        source: 'settings/payment-consent-remove',
        context: { userId },
      });
    } finally {
      setRemovingConsent(false);
      setConfirmOpen(false);
    }
  };

  const handleSave = async () => {
    if (!data?.configuration.principal.id) return;

    setSubmitting(true);
    const payload: UpdateConfigurationReq = {
      timezone: state.tz,
      defaultCharityId: state.charity || null,
    };

    const result = await api.alcohol.zinc.api.vConfigurationUpdate2(
      { version: '1.0', id: data.configuration.principal.id },
      payload,
    );

    result.match({
      ok: async () => {
        // Refresh tokens to get updated configuration claims
        try {
          await fetch('/api/auth/force_tokens');
          await new Promise(res => setTimeout(res, 150));
        } catch {
          // best-effort; proceed regardless
        }

        // Update URL params and reload to reflect changes
        const newQuery = { tz: state.tz, charity: state.charity };
        await router.replace({ pathname: router.pathname, query: newQuery });
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
          {hasPaymentConsent && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
              Payment consent active — you can remove it below.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tzMismatch?.hasMismatch && (
            <Alert className="border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/30">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
                Your saved timezone is <strong>{tzMismatch.savedTimezone}</strong> but we detected{' '}
                <strong>{tzMismatch.detectedTimezone}</strong>.{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-800 dark:text-amber-300 underline font-medium"
                  onClick={() => updateFieldImmediate({ tz: tzMismatch.detectedTimezone })}
                >
                  Update to detected timezone
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <FieldCard
            label="Timezone"
            subtitle="We use this to send reminders at the right time"
            restriction="Pick the region closest to you"
            contentClassName="space-y-2"
          >
            <TimezoneComboBox
              options={timezoneOptions}
              value={state.tz}
              onChange={tz => updateFieldImmediate({ tz })}
            />
          </FieldCard>

          <FieldCard
            label="Default Charity"
            subtitle="Where your stakes will go when you miss a habit"
            restriction="You can change this anytime"
            contentClassName="space-y-2"
          >
            <CharitySelector charity={data.charity} returnCharityParam="charity" />
          </FieldCard>

          {hasPaymentConsent && (
            <FieldCard
              label="Payment Consent"
              subtitle="You have active payment consent on file"
              restriction="You can remove this at any time"
              contentClassName="space-y-3"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Removing consent disables future automated charges for stakes. You can re-consent later when needed.
              </p>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={removingConsent}
                variant="destructive"
                className="inline-flex items-center gap-2 px-3 py-2"
              >
                <ShieldX className="w-4 h-4" /> Remove payment consent
              </Button>

              <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleRemoveConsent}
                loading={removingConsent}
                confirmLabel="Remove consent"
                cancelLabel="Keep consent"
                title="Remove payment consent?"
                description={
                  <span>
                    If you remove consent, any donations or stake payments will fail until you re-consent. You won't be
                    able to donate to charity through LazyTax.
                  </span>
                }
              />
            </FieldCard>
          )}

          {!hasPaymentConsent && (
            <FieldCard
              label="Payment Consent"
              subtitle="Set up payment consent to enable stakes and donations"
              restriction="You can withdraw consent anytime"
              contentClassName="space-y-3"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Without payment consent, stake payments and donations will fail. Set it up to allow automatic $1–$2
                stakes and charitable donations when you miss.
              </p>
              <Button
                onClick={() => {
                  // Start consent flow and return to settings afterward
                  const returnUrl =
                    typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/settings';
                  checkAndInitiatePayment(() => router.replace(returnUrl), returnUrl).catch(() => {
                    // error surfaced by hook; do nothing here
                  });
                }}
                disabled={checking}
                className="inline-flex items-center gap-2 px-3 py-2"
              >
                {checking ? (
                  <>
                    <span>Setting up…</span>
                    <Spinner size="sm" variant="rays" className="[animation-duration:600ms] text-white/90" />
                  </>
                ) : (
                  <span>Set up payment consent</span>
                )}
              </Button>
            </FieldCard>
          )}
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
  async (context, { apiTree }): Promise<GetServerSidePropsResult<SettingsPageProps>> => {
    const api = apiTree.alcohol.zinc.api;

    const result = await api.vConfigurationMeList({ version: '1.0' }).then(configResult =>
      configResult.andThen(async configuration => {
        // Check for missing query params and populate with defaults
        const query = context.query;
        const tz = (query.tz as string) || configuration.principal.timezone || '';
        const charity = (query.charity as string) || configuration.principal.defaultCharityId || '';

        // If any required params are missing, redirect with all params populated
        if (!query.tz || !query.charity) {
          return Err<SettingsPageData, Problem>({
            type: 'redirect',
            title: 'Redirect needed',
            status: 302,
            detail: `/settings?tz=${encodeURIComponent(tz)}&charity=${encodeURIComponent(charity)}`,
          });
        }

        // All params are present, fetch charity and return data
        return (await api.vCharityDetail({ version: '1.0', id: charity })).map(({ principal }) => ({
          configuration,
          charity: principal,
        }));
      }),
    );

    const initial: ResultSerial<SettingsPageData, Problem> = await result.serial();

    // Check if we need to redirect
    if (initial[0] === 'err' && initial[1].type === 'redirect') {
      return {
        redirect: {
          destination: initial[1].detail || '/settings',
          permanent: false,
        },
      };
    }

    return { props: { initial } };
  },
);
