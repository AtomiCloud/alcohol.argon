import React, { useCallback, useState } from 'react';
import Head from 'next/head';
import { AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

import { AlcoholZincApi } from '@/clients/alcohol/zinc/api';
import { createSafeApiClient, SafeApiClient } from '@/lib/api/core/swagger-adapter';
import { Problem } from '@/lib/problem/core';
import type { Result } from '@/lib/monads/result';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchState } from '@/hooks/useUrlState';
import {
  useClientConfig,
  useCommonConfig,
  useProblemTransformer,
  useSwaggerClients,
} from '@/adapters/external/Provider';
import { type GetServerSidePropsResult } from 'next';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

interface DataSection {
  id: string;
  title: string;
  description: string;
  loader: (
    good: SafeApiClient<AlcoholZincApi<unknown>>,
    bad: SafeApiClient<AlcoholZincApi<unknown>>,
  ) => Promise<Result<any, Problem>>;
  icon: React.ReactNode;
}

interface SectionData {
  sectionId: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: any;
  problem?: Problem;
  lastFetch?: string;
}

interface ApiShowcasePageProps {
  initialData: Record<string, SectionData>;
  serverTimestamp: string;
}

export default function ApiShowcasePage({ initialData, serverTimestamp }: ApiShowcasePageProps) {
  const [sectionData, setSectionData] = useState<Record<string, SectionData>>(initialData);

  const clientConfig = useClientConfig();
  const commonConfig = useCommonConfig();
  const zincApiBaseUrl = commonConfig.clients.alcohol.zinc.url;

  const apiTree = useSwaggerClients();
  const safeZincApiGood = apiTree.alcohol.zinc;
  const problemTransformer = useProblemTransformer();

  const zincApiError = new AlcoholZincApi({
    baseUrl: zincApiBaseUrl,
    customFetch: (() => {
      throw new RangeError('Network connection out of range - simulated network failure');
    }) as unknown as typeof fetch,
  });
  const safeZincApiError = createSafeApiClient(zincApiError, { problemTransformer, instance: 'api-showcase-error' });

  const dataSections: DataSection[] = [
    {
      id: 'root',
      title: 'API Root',
      description: 'Basic API health check and root information',
      loader: api => api.getRoot(),
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      id: 'non-existent-error',
      title: 'Non-existent Error',
      description: 'Should show a problem from server-side',
      loader: api => api.api.vErrorInfoDetail('invalid-id', '1.0'),
      icon: <ExternalLink className="h-5 w-5" />,
    },
    {
      id: 'user-list',
      title: 'Non-existent User (Requires Auth)',
      description: 'Should show an local-mapped, http_error, empty problem',
      loader: api => api.api.vUserList({ version: '1.0', Username: 'nonexistent' }),
      icon: <ExternalLink className="h-5 w-5" />,
    },
    {
      id: 'random-error',
      title: 'Random, non-JSON Error',
      description: 'Should show an local-mapped, http_error, with the error content in the problem',
      loader: api => api.api.vErrorInfoRandomErrorList('1.0'),
      icon: <AlertCircle className="h-5 w-5" />,
    },
    {
      id: 'local-error',
      title: 'Emulated Local error',
      description:
        'Fetch function itself throws an error, which should be an local_error, with the stack trace in the problem',
      loader: (_, api) => api.api.vErrorInfoRandomErrorList('1.0'),
      icon: <AlertCircle className="h-5 w-5" />,
    },
  ];

  const loadSectionData = useCallback(
    async (sectionId: string) => {
      const section = dataSections.find(s => s.id === sectionId);
      if (!section) return;

      setSectionData(prev => ({
        ...prev,
        [sectionId]: { sectionId, status: 'loading' },
      }));

      const result = await section.loader(safeZincApiGood, safeZincApiError);

      await result.match({
        ok: data => {
          setSectionData(prev => ({
            ...prev,
            [sectionId]: {
              sectionId,
              status: 'success',
              data,
              lastFetch: new Date().toISOString(),
            },
          }));
        },
        err: problem => {
          setSectionData(prev => ({
            ...prev,
            [sectionId]: {
              sectionId,
              status: 'error',
              problem,
              lastFetch: new Date().toISOString(),
            },
          }));
        },
      });
    },
    [safeZincApiGood, safeZincApiError],
  );

  const {
    query: activeSection,
    setQuery: setActiveSection,
    isSearching,
  } = useSearchState(
    'section',
    '',
    useCallback(
      async (sectionId: string) => {
        if (sectionId) {
          await loadSectionData(sectionId);
        }
      },
      [loadSectionData],
    ),
    { loadingDelay: 100 },
  );

  const loadAllData = async () => {
    for (const section of dataSections) {
      await loadSectionData(section.id);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const renderSectionContent = (data: SectionData) => {
    switch (data.status) {
      case 'loading':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default">✅ Success</Badge>
              {data.lastFetch && (
                <span className="text-xs text-gray-500">{new Date(data.lastFetch).toLocaleTimeString()}</span>
              )}
            </div>
            <pre className="bg-green-50 p-3 rounded text-sm overflow-auto max-h-60 border">
              {JSON.stringify(data.data, null, 2)}
            </pre>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">❌ Problem Details</Badge>
              {data.lastFetch && (
                <span className="text-xs text-gray-500">{new Date(data.lastFetch).toLocaleTimeString()}</span>
              )}
            </div>
            <pre className="bg-red-50 p-3 rounded text-sm overflow-auto max-h-60 border">
              {JSON.stringify(data.problem, null, 2)}
            </pre>
          </div>
        );

      default:
        return <div className="text-gray-500 italic">Click "Load Data" to fetch from API</div>;
    }
  };

  return (
    <>
      <Head>
        <title>API Showcase - Alcohol Argon</title>
        <meta
          name="description"
          content="API data loading with Problem Details error handling and Faro error reporting"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">API Showcase</h1>
          <p className="text-gray-600 mb-4">
            Real-time API data loading with Problem Details error handling and Faro error reporting. Initial data loaded
            on server, additional loads happen client-side.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{dataSections.length}</div>
                <div className="text-sm text-gray-600">API Endpoints</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(sectionData).filter(d => d.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Successful Loads</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(sectionData).filter(d => d.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Problem Details</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {clientConfig.faro.enabled ? 'Active' : 'Disabled'}
                </div>
                <div className="text-sm text-gray-600">Faro Reporting</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              onClick={loadAllData}
              disabled={Object.values(sectionData).some(d => d.status === 'loading')}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh All Data
            </Button>

            <Button variant="outline" onClick={() => setSectionData(initialData)}>
              Reset to Initial
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dataSections.map(section => {
            const data = sectionData[section.id] || { sectionId: section.id, status: 'idle' as const };
            const isLoading = activeSection === section.id && isSearching;

            return (
              <Card key={section.id} className="h-fit">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection(section.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                      Load Data
                    </Button>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>

                <CardContent>{renderSectionContent(data)}</CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>API Base URL:</strong> <code>{zincApiBaseUrl}</code>
                </div>
                <div>
                  <strong>Landscape:</strong> <code>{clientConfig.landscape}</code>
                </div>
                <div>
                  <strong>Faro Enabled:</strong> <code>{clientConfig.faro.enabled.toString()}</code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                What's Demonstrated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• SSR initial data loading</li>
                <li>• Client-side additional loads via URL state</li>
                <li>• RFC 7807 Problem Details for all errors</li>
                <li>• Faro error reporting integration</li>
                <li>• Configuration-driven API endpoints</li>
                <li>• Result monad error handling</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div>Server render time: {serverTimestamp}</div>
              <div>Active section: {activeSection || 'None'}</div>
              <div>Loading: {isSearching ? 'Yes' : 'No'}</div>
              <div>Initial sections loaded: {Object.keys(initialData).length}</div>
              <div>Data source: {Object.keys(initialData).length > 0 ? '🏗️ SSR + Client' : '🔥 Client-only'}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  buildTime,
  async (_, { config, apiTree, problemTransformer }): Promise<GetServerSidePropsResult<ApiShowcasePageProps>> => {
    const zincApiBaseUrl = config.common.clients.alcohol.zinc.url;

    const safeZincApiGood = apiTree.alcohol.zinc;

    const zincApiError = new AlcoholZincApi({
      baseUrl: zincApiBaseUrl,
      customFetch: (() => {
        throw new RangeError('Network connection out of range - simulated network failure');
      }) as unknown as typeof fetch,
    });
    const safeZincApiError = createSafeApiClient(zincApiError, {
      problemTransformer,
      instance: 'api-showcase-ssr-error',
    });

    const dataSections = [
      {
        id: 'root',
        loader: () => safeZincApiGood.getRoot(),
      },
      {
        id: 'non-existent-error',
        loader: () => safeZincApiGood.api.vErrorInfoDetail('invalid-id', '1.0'),
      },
      {
        id: 'user-list',
        loader: () => safeZincApiGood.api.vUserList({ version: '1.0', Username: 'nonexistent' }),
      },
      {
        id: 'random-error',
        loader: () => safeZincApiGood.api.vErrorInfoRandomErrorList('1.0'),
      },
      {
        id: 'local-error',
        loader: () => safeZincApiError.api.vErrorInfoRandomErrorList('1.0'),
      },
    ];

    const initialData: Record<string, SectionData> = {};

    for (const section of dataSections) {
      const result = await section.loader();
      await result.match({
        ok: data => {
          initialData[section.id] = {
            sectionId: section.id,
            status: 'success',
            data,
            lastFetch: new Date().toISOString(),
          };
        },
        err: problem => {
          initialData[section.id] = {
            sectionId: section.id,
            status: 'error',
            problem,
            lastFetch: new Date().toISOString(),
          };
        },
      });
    }
    return {
      props: {
        initialData,
        serverTimestamp: new Date().toISOString(),
      },
    };
  },
);
