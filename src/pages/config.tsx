import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { configSchemas } from '@/config';
import type { CommonConfig, ClientConfig } from '@/config';
import Link from 'next/link';
import { importedConfigurations } from '@/config/configs';
import { useClientConfig, useCommonConfig } from '@/lib/config/providers';
import { withServerSideConfig } from '@/lib/config/next';

interface ConfigPageProps {
  serverTime: string;
  appName: string;
}

export default function ConfigPage({ serverTime, appName }: ConfigPageProps) {
  const commonConfig = useCommonConfig<CommonConfig>();
  const clientConfig = useClientConfig<ClientConfig>();

  return (
    <>
      <Head>
        <title>Configuration & Diagnostics - {appName}</title>
        <meta name="description" content="Configuration system and build diagnostics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
              Configuration & Diagnostics
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Configuration System, Build Information, and Service Tree Diagnostics
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-w-7xl mx-auto">
            {/* Build Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Build Information</CardTitle>
                <CardDescription>Application build details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Commit SHA:</span>
                    <div className="font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded mt-1">
                      {commonConfig.app.build.sha || 'unknown'}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Build Version:</span>
                    <div className="font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded mt-1">
                      {commonConfig.app.build.version || 'unknown'}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Build Time:</span>
                    <div className="font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded mt-1">
                      {commonConfig.app.build.time ? new Date(commonConfig.app.build.time).toLocaleString() : 'unknown'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Tree Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-600">AtomiCloud Service Tree</CardTitle>
                <CardDescription>Service hierarchy and deployment context</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Landscape:</span>
                    <div className="font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 p-2 rounded mt-1">
                      {commonConfig.app.servicetree.landscape || 'unknown'}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Platform:</span>
                    <div className="font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 p-2 rounded mt-1">
                      {commonConfig.app.servicetree.platform}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Service:</span>
                    <div className="font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 p-2 rounded mt-1">
                      {commonConfig.app.servicetree.service}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Module:</span>
                    <div className="font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 p-2 rounded mt-1">
                      {commonConfig.app.servicetree.module}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Common Configuration</CardTitle>
                <CardDescription>Shared between client and server</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">App Name:</span>
                    <div className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-1">
                      {commonConfig.app.name}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Version:</span>
                    <div className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-1">
                      {commonConfig.app.build.version}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Landscape:</span>
                    <div className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-1">
                      {commonConfig.landscape}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Client Configuration</CardTitle>
                <CardDescription>Browser-safe settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Landscape:</span>
                    <div className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      {clientConfig.landscape}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Faro Enabled:</span>
                    <div className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      {clientConfig.faro.enabled ? 'ON' : 'OFF'}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Session Tracking:</span>
                    <div className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      {clientConfig.faro.sessionTracking.enabled ? 'ON' : 'OFF'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideConfig(
  process.env.LANDSCAPE || 'base',
  configSchemas,
  importedConfigurations,
  async (context, config) => {
    const serverTime = new Date().toISOString();

    return {
      props: {
        serverTime,
        appName: config.common.app.name,
      },
    };
  },
);
