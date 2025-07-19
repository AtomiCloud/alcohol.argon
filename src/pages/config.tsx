import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withServerSideConfig } from '@/lib/config';
import { configSchemas } from '@/config';
import { useCommonConfig, useClientConfig } from '@/lib/config';
import type { CommonConfig, ClientConfig } from '@/config';
import Link from 'next/link';

interface ConfigPageProps {
  serverTime: string;
  appName: string;
  debugMode: boolean;
  serverConfig: {
    database: {
      connections: number;
    };
    security: {
      origins: string[];
    };
  };
}

export default function ConfigPage({ serverTime, appName, debugMode, serverConfig }: ConfigPageProps) {
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
                      {commonConfig.app.version}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Debug Mode:</span>
                    <div className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-1">
                      {commonConfig.features.debug ? 'ON' : 'OFF'}
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
                    <span className="font-semibold text-slate-700 dark:text-slate-300">API Base URL:</span>
                    <div className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      {clientConfig.api.baseUrl}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">API Timeout:</span>
                    <div className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      {clientConfig.api.timeout}ms
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">UI Theme:</span>
                    <div className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      {clientConfig.ui.theme}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Animations:</span>
                    <div className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      {clientConfig.ui.animations ? 'ON' : 'OFF'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Server Configuration</CardTitle>
                <CardDescription>Server-only settings (from SSR)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">DB Max Connections:</span>
                    <div className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded mt-1">
                      {serverConfig.database.connections}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">CORS Origins:</span>
                    <div className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded mt-1">
                      {serverConfig.security.origins.length > 0
                        ? serverConfig.security.origins.join(', ')
                        : 'None configured'}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Rendered At:</span>
                    <div className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded mt-1">
                      {serverTime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Configuration System Features</CardTitle>
                <CardDescription>How this demonstration works</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-600">Build Info</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Git commit SHA</li>
                      <li>• Build version & timestamp</li>
                      <li>• Injected at build time</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-teal-600">Service Tree</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• AtomiCloud hierarchy</li>
                      <li>• Deployment context</li>
                      <li>• Environment awareness</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600">Common Config</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Shared between client & server</li>
                      <li>• Loaded via useCommonConfig()</li>
                      <li>• Type-safe with Zod validation</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Client Config</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Browser-safe settings only</li>
                      <li>• Loaded via useClientConfig()</li>
                      <li>• Available in React components</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-600">Server Config</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Server-only sensitive data</li>
                      <li>• Passed via getServerSideProps</li>
                      <li>• Never exposed to client</li>
                    </ul>
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

export const getServerSideProps = withServerSideConfig(configSchemas, async (context, config) => {
  const serverTime = new Date().toISOString();

  return {
    props: {
      serverTime,
      appName: config.common.app.name,
      debugMode: config.common.features.debug,
      serverConfig: {
        database: {
          connections: config.server.database.connections,
        },
        security: {
          origins: config.server.security.origins,
        },
      },
    },
  };
});
