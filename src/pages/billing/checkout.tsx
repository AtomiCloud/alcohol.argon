import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { SubscriptionRes } from '@/clients/alcohol/zinc/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AsyncButton } from '@/components/ui/async-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { chargeFailureIntentStatus, classifyBillingError, type BillingErrorKind } from '@/lib/billing/errors';
import { TIER_PRICING, formatUsdCents, parsePaidTier, type PaidTier } from '@/lib/billing/pricing';
import { useSubscription } from '@/lib/billing/use-subscription';
import type { Problem } from '@/lib/problem/core';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { AlertCircle, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';

interface CheckoutPageProps {
  tier: PaidTier;
  /** Present after the Airwallex HPP round-trip — auto-continue with subscribe. */
  resume: boolean;
}

type CheckoutPhase = 'idle' | 'subscribing' | 'success';

interface CheckoutError {
  kind: BillingErrorKind;
  message: string;
}

export default function CheckoutPage({ tier, resume }: CheckoutPageProps) {
  const router = useRouter();
  const problemReporter = useProblemReporter();
  const { subscribe } = useSubscription();
  const { checkAndInitiatePayment, checking } = usePaymentConsent({ purpose: 'subscription' });

  const [phase, setPhase] = useState<CheckoutPhase>('idle');
  const [error, setError] = useState<CheckoutError | null>(null);
  const [result, setResult] = useState<SubscriptionRes | null>(null);
  const resumedRef = useRef(false);
  const retriedRef = useRef(false);

  const pricing = TIER_PRICING[tier];
  const resumeUrl = useMemo(() => `/billing/checkout?tier=${tier}&resume=1`, [tier]);

  const describeProblem = useCallback((problem: Problem): CheckoutError => {
    const kind = classifyBillingError(problem);
    switch (kind) {
      case 'no_payment_consent':
        return { kind, message: 'Set up a payment method first — it only takes a minute.' };
      case 'subscription_charge_failed': {
        const intentStatus = chargeFailureIntentStatus(problem);
        return {
          kind,
          message: `Your card was declined${intentStatus ? ` (${intentStatus})` : ''}. Check with your bank, try again, or use a different card.`,
        };
      }
      case 'renewal_in_progress':
        return { kind, message: "We're processing your account — this usually resolves in a moment." };
      default:
        return { kind, message: problem.detail || 'Something went wrong. Please try again.' };
    }
  }, []);

  const runSubscribe = useCallback(async () => {
    setPhase('subscribing');
    setError(null);
    const res = await subscribe(tier);
    await res.match({
      ok: async data => {
        setResult(data);
        setPhase('success');
      },
      err: async problem => {
        const kind = classifyBillingError(problem);
        if (kind === 'already_subscribed') {
          // Someone's ahead of us — the billing page is the source of truth.
          await router.replace('/billing');
          return;
        }
        problemReporter.pushError(new Error(problem.title || 'Subscribe failed'), {
          source: 'billing/checkout-subscribe',
          problem,
        });
        if (kind === 'renewal_in_progress' && !retriedRef.current) {
          retriedRef.current = true;
          setError(describeProblem(problem));
          await new Promise(r => setTimeout(r, 5000));
          await runSubscribe();
          return;
        }
        setError(describeProblem(problem));
        setPhase('idle');
      },
    });
  }, [subscribe, tier, router, problemReporter, describeProblem]);

  const startCheckout = useCallback(() => {
    setError(null);
    // If the subscription consent already exists this fires immediately;
    // otherwise the browser redirects to the Airwallex HPP and returns to
    // this page with resume=1 via the payment callback.
    checkAndInitiatePayment(() => {
      void runSubscribe();
    }, resumeUrl).catch(() => {
      setError({ kind: 'unknown', message: 'Could not start payment setup. Please try again.' });
    });
  }, [checkAndInitiatePayment, resumeUrl, runSubscribe]);

  // Returning from the HPP round-trip: continue with the subscribe call once.
  useEffect(() => {
    if (resume && !resumedRef.current) {
      resumedRef.current = true;
      void runSubscribe();
    }
  }, [resume, runSubscribe]);

  const busy = checking || phase === 'subscribing';

  return (
    <>
      <Head>
        <title>Checkout - LazyTax</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            Checkout
          </h1>
        </div>

        {phase === 'success' && result ? (
          <Card>
            <CardContent className="space-y-6 p-8 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">You're on {pricing.label}!</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your plan renews on{' '}
                  {result.periodEnd
                    ? new Date(result.periodEnd).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'your next billing date'}
                  .
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/billing">Manage subscription</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {error.kind === 'subscription_charge_failed' ? 'Payment declined' : 'Something needs your attention'}
                </AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>{error.message}</p>
                  <div className="flex flex-wrap gap-2">
                    {error.kind === 'subscription_charge_failed' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => void runSubscribe()} disabled={busy}>
                          Try again
                        </Button>
                        <Button size="sm" variant="outline" onClick={startCheckout} disabled={busy}>
                          Use a different card
                        </Button>
                      </>
                    )}
                    {error.kind === 'no_payment_consent' && (
                      <Button size="sm" variant="outline" onClick={startCheckout} disabled={busy}>
                        Set up payment method
                      </Button>
                    )}
                    {error.kind === 'renewal_in_progress' && (
                      <Button size="sm" variant="outline" onClick={() => void runSubscribe()} disabled={busy}>
                        Try again
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {pricing.label} plan
                  <Badge variant="secondary">Launch price</Badge>
                </CardTitle>
                <CardDescription>
                  <span className="line-through mr-1">{formatUsdCents(pricing.originalCents)}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatUsdCents(pricing.launchCents)}/month
                  </span>{' '}
                  · billed monthly · cancel anytime
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {phase === 'subscribing' ? (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Spinner size="sm" variant="rays" />
                    <span>Activating your plan…</span>
                  </div>
                ) : (
                  <AsyncButton className="w-full" loading={checking} onClick={startCheckout}>
                    {checking
                      ? 'Preparing secure payment…'
                      : `Subscribe for ${formatUsdCents(pricing.launchCents)}/month`}
                  </AsyncButton>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Card details are handled by Airwallex — they never touch our servers.
                </p>
              </CardContent>
            </Card>

            <p className="text-sm text-slate-500 dark:text-slate-500">
              Want a different plan?{' '}
              <Link className="underline" href={`/billing/checkout?tier=${tier === 'pro' ? 'ultimate' : 'pro'}`}>
                See {tier === 'pro' ? 'Ultimate' : 'Pro'}
              </Link>{' '}
              or go back to{' '}
              <Link className="underline" href="/billing">
                billing
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  // guard:'public' + explicit auth check so signed-out visitors (e.g. from the
  // marketing pricing page) round-trip through login and land back here with
  // the tier preserved.
  { ...buildTime, guard: 'public' },
  async (context, { apiTree, auth }): Promise<GetServerSidePropsResult<CheckoutPageProps>> => {
    const tier = parsePaidTier(Array.isArray(context.query.tier) ? context.query.tier[0] : context.query.tier);
    if (!tier) {
      return { redirect: { destination: '/billing', permanent: false } };
    }

    const userId = await auth.retriever
      .getClaims()
      .map((x): string | null => (x.value.isAuthed ? x.value.data.sub : null))
      .unwrapOr(null);
    if (!userId) {
      return {
        redirect: {
          destination: `/api/logto/sign-in?redirectBackUrl=${encodeURIComponent(
            context.resolvedUrl || `/billing/checkout?tier=${tier}`,
          )}`,
          permanent: false,
        },
      };
    }

    // Already on this tier (and not pending cancellation)? Nothing to buy.
    const currentResult = await apiTree.alcohol.zinc.api.vSubscriptionDetail({ version: '1.0', userId });
    const current = await currentResult.map((x): SubscriptionRes | null => x).unwrapOr(null);
    if (
      current &&
      current.tier === tier &&
      (current.status === 'active' || current.status === 'grace') &&
      !current.cancelAtPeriodEnd
    ) {
      return { redirect: { destination: '/billing', permanent: false } };
    }

    const resume = (Array.isArray(context.query.resume) ? context.query.resume[0] : context.query.resume) === '1';

    return { props: { tier, resume } };
  },
);
