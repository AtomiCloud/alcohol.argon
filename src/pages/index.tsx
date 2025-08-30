import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { importedConfigurations } from '@/config/configs';
import { withServerSideConfig } from '@/adapters/external/next';
import { useCommonConfig } from '@/adapters/external/Provider';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

interface HomeProps {
  serverTime: string;
  userAgent: string;
  appName: string;
}

export default function Home({ serverTime, userAgent, appName }: HomeProps) {
  const commonConfig = useCommonConfig();
  return (
    <>
      <Head>
        <title>{appName} - SSR Frontend</title>
        <meta name="description" content="Next.js SSR frontend with OpenNext on Cloudflare Workers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
              {appName}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Next.js SSR Frontend with OpenNext on Cloudflare Workers :3
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Server-Side Rendering</CardTitle>
                <CardDescription>This page was rendered on the server</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Server time: <span className="font-mono font-semibold">{serverTime}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cloudflare Workers</CardTitle>
                <CardDescription>Running on the edge</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Deployed with OpenNext adapter for optimal performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration System</CardTitle>
                <CardDescription>Type-safe hierarchical configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    App Version: <span className="font-mono font-semibold">{commonConfig.app.build.version}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/config">Configuration Demo</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/templates">Search Templates</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/lottie-demo">Lottie Animations</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/problem-demo">Problem Details</Link>
              </Button>
            </div>
          </div>

          <Card className="mt-12 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
              <CardDescription>Server-side request details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">User Agent:</span>
                  <p className="font-mono text-xs mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">{userAgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(buildTime, async (context, { config }) => {
  // Access config.common, config.client, config.server
  const serverTime = new Date().toISOString();
  const userAgent = context.req.headers['user-agent'] || 'Unknown';

  return {
    props: {
      serverTime,
      userAgent,
      appName: config.common.app.name,
    },
  };
});
