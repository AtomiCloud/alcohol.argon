import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { Search, X } from 'lucide-react';
import { searchTemplates, type Template } from '@/lib/template-api';
import { TemplateEmpty, TemplateLoadingSkeleton, TemplateResults } from '@/components/TemplateResults';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import { useProblemTransformer } from '@/adapters/external/Provider';
import { Res, type ResultSerial } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useSearchState } from '@/lib/urlstate/useSearchState';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import { FreeContentManager } from '@/lib/content/components/FreeContentManager';

type Query = { q: string; limit: string };

interface TemplatePageProps {
  initialResults: ResultSerial<Template[], Problem>;
  initialQuery: Query;
  serverTimestamp: string;
}

export default function TemplatePage({ initialResults, initialQuery, serverTimestamp }: TemplatePageProps) {
  const [results, setResults] = useState(Res.fromSerial<Template[], Problem>(initialResults));
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();
  const transformer = useProblemTransformer();

  const content = useContent(results, {
    loaderDelay: 50,
    notFound: 'No templates found',
    loader,
    empty,
  });

  // Search handler that executes search
  const handleSearch = useCallback(
    ({ q, limit }: Query) => setResults(searchTemplates(transformer, q, limit ? Number.parseInt(limit) : undefined)),
    [transformer],
  );

  // URL-synchronized search state with validators
  const { query, setQuery, clearSearch } = useSearchState(
    {
      q: initialQuery.q,
      limit: initialQuery.limit,
    },
    handleSearch,
    {
      debounceMs: 50,
      validators: {
        q: (value: string) => value.length >= 0, // Allow any query including empty
        limit: (value: string) => {
          if (!value.trim()) return true; // Allow empty (will use default)
          const num = Number.parseInt(value, 10);
          return !Number.isNaN(num) && num > 0 && num <= 100; // Valid number between 1-100
        },
      },
    },
  );

  const handleInputChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => setQuery({ q: e.target.value });

  const handleInputChangeLimit = (e: React.ChangeEvent<HTMLInputElement>) => setQuery({ limit: e.target.value });

  return (
    <>
      <Head>
        <title>Templates - Alcohol Argon</title>
        <meta name="description" content="Search for project templates and boilerplates" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
              Search Project Templates
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Discover templates and boilerplates for your next project
            </p>

            {/* Search Input */}
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search for React, Next.js, API templates..."
                    value={query.q}
                    onChange={handleInputChangeQuery}
                    className="pl-10 pr-10 h-12 text-lg bg-white text-slate-900 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Limits"
                    value={query.limit}
                    onChange={handleInputChangeLimit}
                    className="pl-10 pr-10 h-12 text-lg bg-white text-slate-900 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Results */}
          <FreeContentManager
            LoadingComponent={TemplateLoadingSkeleton}
            EmptyComponent={TemplateEmpty}
            loadingState={loading}
            emptyState={desc}
          >
            {content && (
              <div className="max-w-7xl mx-auto">
                <TemplateResults templates={content} />
              </div>
            )}
          </FreeContentManager>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-8 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>Server render time: {serverTimestamp}</div>
                <div>Searching: {loading ? 'Yes' : 'No'}</div>
                <div>
                  Initial query: &ldquo;q={initialQuery.q}&rdquo; &ldquo;limit={initialQuery.limit}&rdquo;
                </div>
                <div>
                  Current query: &ldquo;q={query.q}&rdquo; &ldquo;limit={query.limit}&rdquo;
                </div>
                <div>Results: {Array.isArray(content) ? content.length : 0}</div>
                <div>
                  Data source:{' '}
                  {query.q === initialQuery.q && query.limit === initialQuery.limit.toString()
                    ? '🏗️ SSR'
                    : '🔥 Client-side'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  buildTime,
  async ({ query }, { problemTransformer }): Promise<GetServerSidePropsResult<TemplatePageProps>> => {
    const searchQuery = (query.q as string) || '';
    const limit = Number.parseInt((query.limit as string | undefined) ?? '20');
    const searchResults = await searchTemplates(problemTransformer, searchQuery, limit).serial();
    return {
      props: {
        initialResults: searchResults,
        initialQuery: { q: searchQuery ?? '', limit: (query?.limit as string | undefined) ?? '' },
        serverTimestamp: new Date().toISOString(),
      },
    };
  },
);
