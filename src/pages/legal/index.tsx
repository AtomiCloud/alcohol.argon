import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/adapters/external/Provider';

const legalVersions = [
  {
    date: '2025-09-26',
    description: 'Initial LazyTax-specific version with PDPA/GDPR compliance and charity donation framework',
    changes: [
      'Added PDPA/GDPR compliance sections',
      'Added Privacy Officer details (Ho Ching Wee, chingwee@lazytax.club)',
      'Added custom frequency habits support (daily, weekly, custom intervals)',
      'Added streak and gamification data handling',
      'Specified USD currency for all transactions',
      'Clarified LazyTax as the legal donor (not users) - no tax receipts for users',
      'Added 100% donation policy after third-party fees (Airwallex + Pledge.to)',
      'Added comprehensive charity donation legal framework',
      'Added fair use and protecting interests sections',
      'Made subscription fees non-refundable',
      'Added detailed fee transparency disclosures',
    ],
    current: true,
  },
];

export default function LegalIndex() {
  const { common } = useConfig();
  const appName = common.app.name;
  const title = `${appName} — Legal Documents`;
  const description = `Legal documents for ${appName} including privacy policy, terms & conditions, and refund policy with version history.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Legal Documents</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Privacy policy, terms & conditions, and refund policy for {appName}
            </p>
          </div>

          {/* Current Version - Quick Access */}
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Current Legal Documents</CardTitle>
                <Badge variant="default">Active</Badge>
              </div>
              <CardDescription>Currently effective legal documents (Version: {legalVersions[0].date})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/legal/privacy"
                  className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Privacy Policy</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    How we collect, use, and protect your data
                  </p>
                </Link>

                <Link
                  href="/legal/terms"
                  className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Terms & Conditions</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Rules governing use of our service</p>
                </Link>

                <Link
                  href="/legal/refund"
                  className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Refund Policy</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Refund rules for penalties and subscriptions
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Document Version History</CardTitle>
              <CardDescription>All versions of our legal documents with change summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {legalVersions.map(version => (
                <div key={version.date} className="border-l-4 border-slate-200 dark:border-slate-700 pl-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Version {version.date}</h3>
                    {version.current && <Badge variant="default">Current</Badge>}
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-3">{version.description}</p>

                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <Link
                      href={`/legal/${version.date}/privacy`}
                      className="text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href={`/legal/${version.date}/terms`}
                      className="text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                      Terms & Conditions
                    </Link>
                    <Link
                      href={`/legal/${version.date}/refund`}
                      className="text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                      Refund Policy
                    </Link>
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                      Show changes in this version ({version.changes.length} changes)
                    </summary>
                    <ul className="mt-2 ml-4 space-y-1">
                      {version.changes.map(change => (
                        <li key={change} className="text-slate-600 dark:text-slate-400">
                          • {change}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Footer Info */}
          <Card>
            <CardHeader>
              <CardTitle>About Legal Document Versions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                We maintain all versions of our legal documents for transparency. When we update our legal terms, we
                create a new dated version while keeping previous versions accessible.
              </p>
              <p>
                <strong>Current documents</strong> are always available at the standard URLs (
                <code>/legal/privacy</code>, <code>/legal/terms</code>, <code>/legal/refund</code>) and automatically
                redirect to the most recent version.
              </p>
              <p>
                <strong>Previous versions</strong> remain accessible for reference using their specific dates (e.g.,{' '}
                <code>/legal/2025-09-26/privacy</code>).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
