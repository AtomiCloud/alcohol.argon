import { useEffect, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { useUserId } from '@/lib/auth/use-user';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { TrackingEvents } from '@/lib/events';

type PaymentCallbackStatus = 'success' | 'failed' | 'cancelled';

interface PaymentCallbackPageProps {
  status: PaymentCallbackStatus;
  returnUrl: string | null;
}

export default function PaymentCallbackPage({ status, returnUrl }: PaymentCallbackPageProps) {
  const router = useRouter();
  const { pollPaymentConsent } = usePaymentConsent();
  const userId = useUserId();
  const track = usePlausible();
  const [polling, setPolling] = useState(false);
  const [pollingComplete, setPollingComplete] = useState(false);
  const [pollingError, setPollingError] = useState(false);

  // Track page view and payment status
  useEffect(() => {
    track(TrackingEvents.Payment.Callback.PageViewed);
    if (status === 'success') {
      track(TrackingEvents.Payment.Callback.Success);
    } else if (status === 'failed') {
      track(TrackingEvents.Payment.Callback.Failed);
    } else if (status === 'cancelled') {
      track(TrackingEvents.Payment.Callback.Cancelled);
    }
  }, [status, track]);

  useEffect(() => {
    // Only poll if payment was successful and we have a userId ready
    if (status === 'success' && userId && !polling && !pollingComplete && !pollingError) {
      track(TrackingEvents.Payment.Callback.PollingStarted);
      setPolling(true);
      pollPaymentConsent(
        async () => {
          track(TrackingEvents.Payment.Callback.PollingSuccess);
          setPolling(false);
          setPollingComplete(true);
          // Force-refresh tokens to ensure claims updated, then redirect
          try {
            await fetch('/api/auth/force_tokens');
          } catch {}
          // Redirect back to the return URL with all preserved query params
          if (returnUrl) {
            router.replace(returnUrl);
          } else {
            router.replace('/app');
          }
        },
        () => {
          track(TrackingEvents.Payment.Callback.PollingError);
          setPolling(false);
          setPollingError(true);
        },
      );
    }
  }, [status, userId, polling, pollingComplete, pollingError, pollPaymentConsent, returnUrl, router, track]);

  // Handle failed/cancelled payments
  if (status === 'failed' || status === 'cancelled') {
    return (
      <>
        <Head>
          <title>LazyTax — Payment Failed</title>
          <meta name="robots" content="noindex" />
        </Head>

        <div className="container mx-auto max-w-3xl px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Payment Setup Failed</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {status === 'cancelled'
                    ? 'You cancelled the payment setup process.'
                    : 'There was an issue setting up your payment method. Please try again.'}
                </p>
              </div>

              <Button onClick={() => router.replace(returnUrl || '/app')} className="w-full">
                Return to App
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Handle polling error
  if (pollingError) {
    return (
      <>
        <Head>
          <title>LazyTax — Payment Consent Error</title>
          <meta name="robots" content="noindex" />
        </Head>

        <div className="container mx-auto max-w-3xl px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Payment Consent Timeout</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  We couldn't confirm your payment consent within the expected time. This might be a temporary issue.
                </p>
              </div>

              <div className="space-y-2">
                <Button onClick={() => router.replace(returnUrl || '/app')} className="w-full">
                  Return to App
                </Button>
                <Button
                  onClick={() => {
                    track(TrackingEvents.Payment.Callback.RetryClicked);
                    setPollingError(false);
                    setPolling(true);
                    pollPaymentConsent(
                      async () => {
                        track(TrackingEvents.Payment.Callback.PollingSuccess);
                        setPolling(false);
                        setPollingComplete(true);
                        try {
                          await fetch('/api/auth/force_tokens');
                        } catch {}
                        router.replace(returnUrl || '/app');
                      },
                      () => {
                        track(TrackingEvents.Payment.Callback.PollingError);
                        setPolling(false);
                        setPollingError(true);
                      },
                    );
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Successful status but user not yet resolved: show lightweight loading state first
  if (status === 'success' && !userId && !pollingComplete) {
    return (
      <>
        <Head>
          <title>LazyTax — Preparing</title>
          <meta name="robots" content="noindex" />
        </Head>

        <div className="container mx-auto max-w-3xl px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="space-y-6 p-8 text-center">
              <Spinner size="lg" />
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Getting things ready…</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading your account before confirming payment setup.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Polling in progress
  return (
    <>
      <Head>
        <title>LazyTax — Confirming Payment</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto max-w-3xl px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="space-y-6 p-8 text-center">
            {pollingComplete ? (
              <>
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold">Payment Setup Complete!</h1>
                  <p className="text-slate-600 dark:text-slate-400">Redirecting you back...</p>
                </div>
              </>
            ) : (
              <>
                <Spinner size="lg" />
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold">Confirming Payment Setup</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Please wait while we confirm your payment method. This may take up to 2 minutes.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Do not close this window or navigate away.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (context): Promise<GetServerSidePropsResult<PaymentCallbackPageProps>> => {
    const {
      payment_status,
      status: statusParam,
      return_url,
    } = context.query as Record<string, string | string[] | undefined>;

    // Normalize possibly-array query params to a lowercase string
    const normalize = (v: string | string[] | undefined): string | null => {
      if (!v) return null;
      const s = Array.isArray(v) ? v[0] : v;
      return typeof s === 'string' ? s.toLowerCase() : null;
    };

    const normalized = normalize(payment_status) ?? normalize(statusParam);

    // Determine status (tolerant to common variants)
    const status: PaymentCallbackStatus = (() => {
      switch (normalized) {
        case 'success':
        case 'succeeded':
        case 'ok':
        case 'completed':
        case 'authorized':
          return 'success';
        case 'cancelled':
        case 'canceled':
        case 'cancel':
          return 'cancelled';
        default:
          // Treat any non-cancel/success value as failure (e.g. 'fail', 'failed', 'error')
          return 'failed';
      }
    })();

    // Decode return URL if present
    const returnUrl = typeof return_url === 'string' ? decodeURIComponent(return_url) : null;

    return {
      props: {
        status,
        returnUrl,
      },
    };
  },
);
