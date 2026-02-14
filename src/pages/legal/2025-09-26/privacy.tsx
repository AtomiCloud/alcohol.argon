import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfig } from '@/adapters/external/Provider';
//

export default function PrivacyPolicy() {
  const { common, client } = useConfig();
  const appName = common.app.name;
  const title = `${appName} — Privacy Policy`;
  const description = `How ${appName} collects, uses, and protects your data, including habit check-ins, payment metadata, and your marketing preferences.`;
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Privacy Policy</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toISOString().slice(0, 10)}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Marketing Communications</CardTitle>
              <CardDescription>
                We may send you marketing communications by default. You can opt out at any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We may send marketing emails about product updates, features, and promotions by default. You can opt out
                at any time using the unsubscribe link in any marketing email or by updating your preferences in your
                account (when available).
              </p>
              <p>
                Transactional or service emails related to your account, stakes, penalties, or donations may be sent
                regardless of marketing preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                {appName} helps you build habits by letting you stake funds that are donated to charity when you miss a
                daily check-in. This policy explains what we collect and why.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                This Privacy Policy describes how {appName} (the “Service”) collects, uses, shares, and protects
                personal information. Where applicable, it also explains your rights and choices. If you do not agree
                with this policy, please do not use the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Account and Profile: email, display name, and authentication identifiers provided by you or your auth
                  provider.
                </li>
                <li>
                  Habit Data: habit names, daily check-in status (did/did not), timestamps, stakes and penalty rules,
                  and notification preferences.
                </li>
                <li>
                  Payment and Transaction Metadata: payment method tokens from our payment processor, amounts, currency,
                  status, and charity disbursement records. We do not store full payment card details on our servers.
                </li>
                <li>
                  Device/Usage Data: IP address, browser/device type, pages viewed, and interactions, which we use for
                  security, performance, and analytics.
                </li>
                <li>Marketing Preferences: your consent state for marketing email and related preference metadata.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How We Use Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve the Service, including habit creation, daily check-ins, and reminders.</li>
                <li>Process stakes, penalties, and donations to charities, and manage subscription features.</li>
                <li>Prevent fraud, secure the Service, and comply with legal obligations.</li>
                <li>Analyze usage to improve reliability, performance, and user experience.</li>
                <li>Send transactional emails about your account and habits.</li>
                <li>
                  Send marketing communications only if you provide explicit consent. You can withdraw consent at any
                  time via unsubscribe links.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Legal Bases for Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>Contract: to operate the core features you choose to use.</li>
                <li>Legitimate Interests: to secure and improve the Service and prevent abuse.</li>
                <li>Consent: for marketing communications and certain analytics/cookies where required.</li>
                <li>Legal Obligation: to meet regulatory, tax, and compliance requirements.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sharing and Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We share information with service providers who process data on our behalf (e.g., hosting, analytics,
                email delivery, and payment processing). We may share donation details with charities and transaction
                facilitators to complete disbursements. We may disclose information to comply with law, enforce our
                Terms, or protect rights, property, or safety.
              </p>
              <p>
                Data may be transferred to and processed in regions outside your country. Where required, we implement
                appropriate safeguards for international transfers.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We retain information for as long as necessary to provide the Service, comply with legal obligations,
                resolve disputes, and enforce agreements. Donation and transaction records may be retained as required
                by tax or charity laws.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, correct, or delete certain personal information, subject to legal exceptions.</li>
                <li>Opt out of marketing at any time without affecting transactional messages.</li>
                <li>Control cookie and tracking preferences via your browser or device settings.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Children</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                The Service is not directed to children under 13 (or other minimum age as required by local law). We do
                not knowingly collect personal information from children.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We may update this policy to reflect changes to our practices. Material updates will be announced
                through the Service or by email.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Subject Rights (PDPA/GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>Subject to applicable laws, you have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of personal data we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete personal data
                </li>
                <li>
                  <strong>Erasure:</strong> Request deletion of personal data (subject to legal retention requirements)
                </li>
                <li>
                  <strong>Portability:</strong> Request personal data in a structured, machine-readable format
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Withdraw consent for processing where consent is the legal basis
                </li>
                <li>
                  <strong>Object:</strong> Object to processing based on legitimate interests
                </li>
                <li>
                  <strong>Restrict:</strong> Request limitation of processing in certain circumstances
                </li>
              </ul>
              <p>
                To exercise these rights, submit a request in writing to our Privacy Officer. We will respond within 30
                days (or as required by applicable law) and may require identity verification.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We generally process data within Singapore. If we transfer personal data outside Singapore, we will:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Obtain your consent where required</li>
                <li>Ensure the receiving jurisdiction provides comparable data protection</li>
                <li>Implement appropriate safeguards such as standard contractual clauses</li>
                <li>Comply with applicable cross-border transfer requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>We implement appropriate technical and organizational measures to protect personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Access controls and need-to-know principles</li>
                <li>Regular security monitoring and updates</li>
                <li>Secure payment processing through certified providers</li>
                <li>Employee training on data protection</li>
              </ul>
              <p>
                Despite our measures, no system is completely secure. We cannot guarantee absolute security but will
                notify you of any material breaches as required by law.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Regulatory Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                This policy complies with applicable data protection laws including the Personal Data Protection Act
                (PDPA) of Singapore and the General Data Protection Regulation (GDPR) where applicable.
              </p>
              <p>
                For Singapore residents: This policy is aligned with PDPA requirements for consent, notification,
                access, and correction obligations.
              </p>
              <p>
                For EU residents: Where GDPR applies, we process personal data lawfully, fairly, and transparently in
                accordance with GDPR principles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Officer & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Privacy Officer:</strong> Ho Ching Wee
              </p>
              <p>
                <strong>Email:</strong> chingwee@lazytax.club
              </p>
              <p>
                <strong>Address:</strong> 60 PAYA LEBAR ROAD, #07-54, PAYA LEBAR SQUARE, SINGAPORE 409051
              </p>
              <p>
                For general privacy questions or to exercise your data subject rights, contact our Privacy Officer. For
                technical support, contact: {supportEmail}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
