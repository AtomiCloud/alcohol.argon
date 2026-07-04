import { useMemo, useRef, useState } from 'react';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { chargeFailureIntentStatus, classifyBillingError } from '@/lib/billing/errors';
import {
  TIER_PRICING,
  TIER_RANK,
  formatUsdCents,
  parsePaidTier,
  tierLabel,
  type PaidTier,
} from '@/lib/billing/pricing';
import { useSubscription } from '@/lib/billing/use-subscription';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import type { Result, ResultSerial } from '@/lib/monads/result';
import { Res } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, CreditCard, RotateCcw, XCircle } from 'lucide-react';

type BillingPageProps = { initial: ResultSerial<SubscriptionRes, Problem> };

type PendingAction = 'cancel' | 'resume' | 'upgrade' | 'downgrade' | null;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BillingPage({ initial }: BillingPageProps) {
  const router = useRouter();
  const problemReporter = useProblemReporter();
  const { cancel, changeTier, unCancel } = useSubscription();
  const { checkAndInitiatePayment, checking } = usePaymentConsent({ purpose: 'subscription' });

  const dataResult = useMemo(() => Res.fromSerial<SubscriptionRes, Problem>(initial), [initial]);
  const [, loader] = useFreeLoader();
  const sub = useContent(dataResult, { loader, notFound: 'Subscription data not found' });

  const [confirm, setConfirm] = useState<PendingAction>(null);
  const [acting, setActing] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const retriedRef = useRef(false);

  if (!sub) return null; // useContent handles loading/error states

  const paidTier = parsePaidTier(sub.tier);
  const isPaid = paidTier != null && (sub.status === 'active' || sub.status === 'grace');
  const otherTier: PaidTier | null = paidTier === 'pro' ? 'ultimate' : paidTier === 'ultimate' ? 'pro' : null;
  const otherIsUpgrade = paidTier != null && otherTier != null && TIER_RANK[otherTier] > TIER_RANK[paidTier];

  const runAction = async (action: () => Promise<Result<SubscriptionRes, Problem>>, source: string) => {
    setActing(true);
    setBanner(null);
    const result = await action();
    await result.match({
      ok: async () => {
        retriedRef.current = false;
        await router.replace(router.asPath);
      },
      err: async problem => {
        const kind = classifyBillingError(problem);
        // already_subscribed / no_active_subscription are benign state drift
        // resolved by a refresh — not errors worth reporting.
        if (kind !== 'already_subscribed' && kind !== 'no_active_subscription') {
          problemReporter.pushError(new Error(problem.title || 'Billing action failed'), {
            source: `billing/${source}`,
            problem,
          });
        }
        switch (kind) {
          case 'no_payment_consent': {
            setBanner('Set up a payment method to continue.');
            break;
          }
          case 'subscription_charge_failed': {
            const intentStatus = chargeFailureIntentStatus(problem);
            setBanner(
              `Your card was declined${intentStatus ? ` (${intentStatus})` : ''}. Check with your bank or update your payment method, then try again.`,
            );
            break;
          }
          case 'renewal_in_progress': {
            if (!retriedRef.current) {
              retriedRef.current = true;
              setBanner("We're processing your renewal — retrying in a moment…");
              await new Promise(res => setTimeout(res, 5000));
              await runAction(action, source);
              return;
            }
            setBanner("We're processing your renewal — please try again in a moment.");
            break;
          }
          case 'already_subscribed':
          case 'no_active_subscription': {
            // State is out of date — refresh from the server.
            await router.replace(router.asPath);
            break;
          }
          default:
            setBanner(problem.detail || 'Something went wrong. Please try again.');
        }
      },
    });
    setActing(false);
    setConfirm(null);
  };

  const startConsentUpdate = () => {
    checkAndInitiatePayment(() => router.replace(router.asPath), '/billing').catch(() => {
      setBanner('Could not start payment setup. Please try again.');
    });
  };

  return (
    <>
      <Head>
        <title>Billing - LazyTax</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            Billing
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your subscription</p>
        </div>

        {banner && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something needs your attention</AlertTitle>
            <AlertDescription>{banner}</AlertDescription>
          </Alert>
        )}

        {!isPaid && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>You're on Free</CardTitle>
                <CardDescription>Upgrade to unlock more habits, skips, freezes and vacation windows.</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['pro', 'ultimate'] as const).map(tier => (
                <Card key={tier}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {TIER_PRICING[tier].label}
                      <Badge variant="secondary">Launch price</Badge>
                    </CardTitle>
                    <CardDescription>
                      <span className="line-through mr-1">{formatUsdCents(TIER_PRICING[tier].originalCents)}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatUsdCents(TIER_PRICING[tier].launchCents)}/month
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href={`/billing/checkout?tier=${tier}`}>Get {TIER_PRICING[tier].label}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isPaid && paidTier && (
          <div className="space-y-4">
            {sub.status === 'grace' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment problem</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    We couldn't charge your card, and we'll retry soon. Update your payment method to keep your plan.
                  </p>
                  <Button size="sm" variant="outline" onClick={startConsentUpdate} disabled={checking}>
                    {checking ? (
                      <>
                        Starting… <Spinner size="sm" variant="rays" />
                      </>
                    ) : (
                      'Update payment method'
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {sub.cancelAtPeriodEnd && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Your plan ends on {formatDate(sub.periodEnd)}</AlertTitle>
                <AlertDescription>
                  You'll keep {TIER_PRICING[paidTier].label} until then, with no further charges. Changed your mind? You
                  can resume below.
                </AlertDescription>
              </Alert>
            )}

            {!sub.cancelAtPeriodEnd && sub.nextTier && sub.nextTier !== sub.tier && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Plan change scheduled</AlertTitle>
                <AlertDescription>
                  Your plan changes to {tierLabel(sub.nextTier)} on {formatDate(sub.periodEnd)}.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Current plan: {TIER_PRICING[paidTier].label}
                  <Badge variant={sub.status === 'grace' ? 'destructive' : 'default'}>
                    {sub.status === 'grace' ? 'Payment issue' : 'Active'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {formatUsdCents(TIER_PRICING[paidTier].launchCents)}/month
                  {!sub.cancelAtPeriodEnd && <> · Renews on {formatDate(sub.periodEnd)}</>}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-3">
                {sub.cancelAtPeriodEnd ? (
                  <AsyncButton
                    loading={acting && confirm === 'resume'}
                    onClick={() => setConfirm('resume')}
                    idleIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Resume subscription
                  </AsyncButton>
                ) : (
                  <>
                    {otherTier && (
                      <AsyncButton
                        loading={acting && confirm === (otherIsUpgrade ? 'upgrade' : 'downgrade')}
                        onClick={() => setConfirm(otherIsUpgrade ? 'upgrade' : 'downgrade')}
                        idleIcon={
                          otherIsUpgrade ? (
                            <ArrowUpCircle className="w-4 h-4" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4" />
                          )
                        }
                      >
                        {otherIsUpgrade
                          ? `Upgrade to ${TIER_PRICING[otherTier].label}`
                          : `Switch to ${TIER_PRICING[otherTier].label}`}
                      </AsyncButton>
                    )}
                    <Button variant="destructive" onClick={() => setConfirm('cancel')} disabled={acting}>
                      <XCircle className="w-4 h-4" /> Cancel subscription
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <ConfirmDialog
              open={confirm === 'cancel'}
              onOpenChange={open => !open && setConfirm(null)}
              onCancel={() => setConfirm(null)}
              onConfirm={() => runAction(() => cancel(), 'cancel')}
              loading={acting}
              title="Cancel subscription?"
              confirmLabel="Cancel subscription"
              cancelLabel="Keep my plan"
              description={
                <span>
                  You'll keep {TIER_PRICING[paidTier].label} until {formatDate(sub.periodEnd)}, then move to Free. No
                  further charges.
                </span>
              }
            />

            <ConfirmDialog
              open={confirm === 'resume'}
              onOpenChange={open => !open && setConfirm(null)}
              onCancel={() => setConfirm(null)}
              onConfirm={() => runAction(() => unCancel(paidTier), 'resume')}
              loading={acting}
              confirmVariant="default"
              title="Resume subscription?"
              confirmLabel="Resume"
              cancelLabel="Never mind"
              description={
                <span>
                  Your {TIER_PRICING[paidTier].label} plan will continue and renew on {formatDate(sub.periodEnd)}. You
                  won't be charged now.
                </span>
              }
            />

            {otherTier && (
              <ConfirmDialog
                open={confirm === 'upgrade' || confirm === 'downgrade'}
                onOpenChange={open => !open && setConfirm(null)}
                onCancel={() => setConfirm(null)}
                onConfirm={() => runAction(() => changeTier(otherTier), otherIsUpgrade ? 'upgrade' : 'downgrade')}
                loading={acting}
                confirmVariant="default"
                title={
                  otherIsUpgrade
                    ? `Upgrade to ${TIER_PRICING[otherTier].label}?`
                    : `Switch to ${TIER_PRICING[otherTier].label}?`
                }
                confirmLabel={otherIsUpgrade ? 'Upgrade now' : 'Schedule switch'}
                cancelLabel="Never mind"
                description={
                  otherIsUpgrade ? (
                    <span>
                      You'll be charged {formatUsdCents(TIER_PRICING[otherTier].launchCents)} now and your billing
                      period restarts today.
                    </span>
                  ) : (
                    <span>
                      You'll keep {TIER_PRICING[paidTier].label} until {formatDate(sub.periodEnd)}, then switch to{' '}
                      {TIER_PRICING[otherTier].label} at {formatUsdCents(TIER_PRICING[otherTier].launchCents)}/month.
                    </span>
                  )
                }
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  // guard:'public' + explicit auth check so signed-out visitors get a login
  // round-trip back here instead of the global error page.
  { ...buildTime, guard: 'public' },
  async (context, { apiTree, auth }): Promise<GetServerSidePropsResult<BillingPageProps>> => {
    const userId = await auth.retriever
      .getClaims()
      .map((x): string | null => (x.value.isAuthed ? x.value.data.sub : null))
      .unwrapOr(null);
    if (!userId) {
      return {
        redirect: {
          destination: `/api/logto/sign-in?redirectBackUrl=${encodeURIComponent(context.resolvedUrl || '/billing')}`,
          permanent: false,
        },
      };
    }

    const result = await apiTree.alcohol.zinc.api.vSubscriptionDetail({ version: '1.0', userId });
    const initial: ResultSerial<SubscriptionRes, Problem> = await result.serial();
    return { props: { initial } };
  },
);
