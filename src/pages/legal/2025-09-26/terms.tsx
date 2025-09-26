import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfig } from '@/adapters/external/Provider';
//

export default function TermsAndConditions() {
  const { common, client } = useConfig();
  const appName = common.app.name;
  const title = `${appName} — Terms & Conditions`;
  const description = `Terms governing the use of ${appName}, including staking mechanics, penalties, donations to charity, subscriptions, and limitations of liability.`;
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
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Terms & Conditions</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toISOString().slice(0, 10)}
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
              <CardDescription>Welcome to {appName} — we tax people for being lazy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                By accessing or using {appName} (the “Service”), you agree to be bound by these Terms & Conditions
                (“Terms”). If you do not agree, do not use the Service. You must be legally capable of entering a
                contract in your jurisdiction to use the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Habit Staking: You set habits and stake funds. If you fail to complete your daily check-in, a penalty
                  is triggered.
                </li>
                <li>
                  Self-Reported Check-ins: Completion is tracked by your action in the app (clicking that you did it).
                  If you do not check in, the system treats the day as missed.
                </li>
                <li>
                  Penalties and Donations: On missed days, the applicable amount is charged and your stake is sent to
                  charity in accordance with your configuration.
                </li>
                <li>
                  Subscriptions (Future): Upgrades may enable more habits, enhanced notifications, and additional
                  features. Subscription terms apply when available.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Marketing Communications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  We may send you marketing emails from {appName} by default. You can opt out at any time via the
                  unsubscribe link in such emails or your account settings (when available).
                </li>
                <li>
                  Transactional or service emails related to your account, stakes, penalties, or donations may be sent
                  irrespective of marketing preferences.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Accounts and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>Notify us promptly of any unauthorized use or suspected breach.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payments, Penalties, and Donations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Currency:</strong> All payments, penalties, and donations are processed in USD (United States
                  Dollars).
                </li>
                <li>
                  <strong>Penalty Authorization:</strong> You authorize charges for penalties according to your settings
                  when you miss a required check-in (daily, weekly, or custom frequency as configured).
                </li>
                <li>
                  <strong>Charity Donation Structure:</strong> {appName} acts as the donor to your selected charities,
                  not as your agent. You are NOT entitled to tax deductions, receipts, or documentation for penalty
                  amounts donated to charity. The donation is made by {appName} on its own behalf.
                </li>
                <li>
                  <strong>100% Donation Policy:</strong> We donate 100% of penalty amounts to your selected charity
                  after deducting third-party processing fees from Airwallex (payment processor) and Pledge.to (donation
                  platform). These are external service fees that we do not control or profit from.
                </li>
                <li>
                  <strong>Fee Transparency:</strong> Typical fees include payment processing charges (approximately 2.9%
                  + fixed fees) and donation platform fees (varies by charity). The exact amount reaching your chosen
                  charity will be the penalty amount minus these third-party fees.
                </li>
                <li>
                  Stake amounts and penalties are defined by you within allowed limits. Donations triggered by penalties
                  are final once processed and sent to the selected charity or disbursement partner.
                </li>
                <li>
                  We use third-party payment processors (Airwallex) and donation platforms (Pledge.to). You agree to
                  their terms and acknowledge that we do not store full payment card data on our servers.
                </li>
                <li>We reserve the right to suspend or reverse transactions suspected of fraud, abuse, or error.</li>
                <li>
                  No refunds are provided for penalties resulting from missed check-ins due to user circumstances such
                  as travel, time zone changes, device or notification issues, or scheduling conflicts, except as
                  required by law or our posted refund policy.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Risk Controls, Suspensions, and Holds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  We may, at our sole discretion and without prior notice, suspend, limit, terminate, or otherwise take
                  any action regarding your account, subscription, access, transactions, donations, or balances if we
                  believe or suspect activity that is fraudulent, abusive, high risk, non-compliant, or otherwise
                  harmful to users, {appName}, partners, or charities.
                </li>
                <li>
                  Actions may include, without limitation: freezing features; delaying, holding, canceling, clawing back
                  or reversing transactions where permitted by law or processor policies; limiting deposits or
                  disbursements; rate-limiting or blocking devices/IPs; requiring additional verification; auditing
                  activity; or closing accounts.
                </li>
                <li>
                  We may request additional information and are not obligated to disclose specific reasons, detection
                  signals, or details behind enforcement actions. We are not liable for losses arising from such risk
                  controls to the extent permitted by law.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subscriptions (Future Availability)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>Paid plans may offer additional features beyond the free tier.</li>
                <li>Subscription fees are billed on a recurring basis until canceled.</li>
                <li>Cancellation takes effect at the end of the current billing period unless otherwise stated.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information and keep your payment method up to date.</li>
                <li>Manage your notification settings to avoid missing reminders.</li>
                <li>Use the Service in accordance with applicable laws and these Terms.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Check-ins, Time Zones, and Responsibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You are solely responsible for marking each habit as completed within the applicable check-in window.
                  Failure to check in on time will be treated as a miss and may trigger penalties.
                </li>
                <li>
                  You are responsible for managing changes in travel, time zones, daylight saving adjustments, device
                  clock accuracy, connectivity, and notification settings to ensure timely check-ins.
                </li>
                <li>
                  Notifications are provided as a convenience and may not always be delivered. Non-receipt of
                  notifications does not excuse missed check-ins. No refunds are provided for misses due to these
                  circumstances, except as required by law or our posted refund policy.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                The Service is provided on an “as is” and “as available” basis. We do not warrant uninterrupted or
                error-free operation. {appName} is not medical, financial, tax, or legal advice. You are solely
                responsible for decisions relating to your habits and finances.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                To the maximum extent permitted by law, {appName} and its affiliates shall not be liable for indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Fair Use and Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>To ensure fair access and protect the Service, you agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use automated tools, scripts, or bots to interact with the Service without permission</li>
                <li>Attempt to circumvent payment processing, penalty systems, or charity donation mechanisms</li>
                <li>Create multiple accounts to avoid penalties or manipulate the habit tracking system</li>
                <li>Use the Service for any unlawful purpose or in violation of applicable regulations</li>
                <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
                <li>Overload or disrupt our systems through excessive requests or resource consumption</li>
                <li>Impersonate others or provide false information when using the Service</li>
                <li>Attempt to hack, compromise, or gain unauthorized access to our systems or user accounts</li>
              </ul>
              <p>
                We reserve the right to implement usage limits, rate limiting, or other technical controls to ensure
                fair access for all users.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Protecting Our Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                To protect {appName}, our users, and the integrity of the habit accountability system, we reserve the
                right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Monitor usage patterns and implement fraud detection systems to identify suspicious account activity,
                  penalty avoidance, or abuse of streak systems
                </li>
                <li>
                  Verify the authenticity of check-ins through technical means, including device fingerprinting,
                  behavioral analysis, and timing validation
                </li>
                <li>
                  Withhold, delay, or reverse charity donations where we suspect fraudulent activity, until proper
                  investigation is completed
                </li>
                <li>
                  Adjust or override penalty calculations if technical errors, system outages, or data inconsistencies
                  are detected
                </li>
                <li>
                  Share information about suspected fraudulent accounts or payment methods with payment processors, law
                  enforcement, or regulatory authorities as required
                </li>
                <li>
                  Implement automatic safeguards to prevent excessive penalties that may indicate system manipulation or
                  user distress
                </li>
                <li>
                  Require additional verification for high-value stakes or unusual donation patterns to prevent money
                  laundering or abuse
                </li>
              </ul>
              <p>
                These measures help maintain trust in our accountability system and ensure donated funds reach intended
                charities rather than being lost to fraudulent activities.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>We may suspend or terminate access for any violation of these Terms or suspected abuse.</li>
                <li>
                  You may stop using the Service at any time. Termination does not affect obligations incurred prior to
                  termination (e.g., processed penalties or donations).
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Charity Donations and Tax Implications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Donor Status:</strong> {appName} makes charitable donations on its own behalf, not as an agent
                  for users.
                  {appName} is the legal donor for all penalty-triggered charity disbursements.
                </li>
                <li>
                  <strong>No Tax Benefits for Users:</strong> Users are not entitled to tax deductions, receipts, or
                  documentation for donated penalty amounts. Only {appName} receives any tax benefits from charitable
                  donations.
                </li>
                <li>
                  <strong>Charity Selection:</strong> User charity selection is for preference only and does not create
                  any legal or tax relationship between the user and the chosen charity.
                </li>
                <li>
                  <strong>Currency and Processing:</strong> All donations are processed in USD through our third-party
                  partners (Airwallex for payment processing, Pledge.to for donation fulfillment).
                </li>
                <li>
                  <strong>Fee Deduction:</strong> 100% of penalty amounts are donated after deducting unavoidable
                  third-party processing fees. {appName} does not retain any portion of penalty amounts for profit.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We may update these Terms from time to time. Material changes will be communicated through the Service
                or by email. Your continued use constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-700 dark:text-slate-300">
              <p>For questions about these Terms, contact: {supportEmail}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
