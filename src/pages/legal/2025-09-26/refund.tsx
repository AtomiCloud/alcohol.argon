import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfig } from '@/adapters/external/Provider';

export default function RefundPolicy() {
  const { common, client } = useConfig();
  const appName = common.app.name;
  const title = `${appName} — Refund Policy`;
  const description = `Refund rules for penalty charges, charity disbursements, and subscription fees when using ${appName}.`;
  const supportEmail = client.support.email;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen">
        <div className="container mx-auto px-6 sm:px-8 py-12 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Refund Policy</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toISOString().slice(0, 10)}
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Purpose</CardTitle>
              <CardDescription>Clear rules for penalties, donations, and subscriptions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                {appName} exists to enforce your own habit commitments through financial stakes. This refund policy
                explains when charges may be refunded and when they are final.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Penalty Charges and Donations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Penalties occur when you fail to complete a daily check-in. Once processed and disbursed to a charity
                  or donation facilitator, such amounts are generally non-refundable.
                </li>
                <li>
                  If a penalty was charged in error due to a verified technical issue (e.g., a confirmed service outage
                  preventing check-in), contact support within 14 days. We will review and, if appropriate, remedy the
                  charge or make a good-faith adjustment.
                </li>
                <li>
                  Duplicate or fraudulent charges will be investigated and, if confirmed, refunded or reversed as
                  applicable.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subscription Fees (When Available)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Renewals: You can cancel any time to stop future billing. If you cancel, your access continues until
                  the end of the current billing period.
                </li>
                <li>
                  First 7 Days: If you are unsatisfied and have not meaningfully used premium features, contact support
                  within 7 days of initial purchase to request a refund. We evaluate requests case-by-case.
                </li>
                <li>
                  Billing Errors: For accidental duplicate charges or processing errors, contact us within 30 days for
                  correction.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How to Request Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>Email {supportEmail} with your account email and transaction details.</li>
                <li>We may request logs or screenshots to investigate technical issues.</li>
                <li>
                  If a refund is approved, timing depends on your payment method and processor; bank posting can take
                  several business days.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We may update this policy to reflect changes in the Service or legal requirements. Material changes will
                be communicated through the Service or by email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
