import React, { useCallback, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Search, X } from 'lucide-react';
import { searchTemplates, Template } from '@/lib/template-api';
import { TemplateResults } from '@/components/TemplateResults';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchState } from '@/hooks/useUrlState';

interface TemplatePageProps {
  initialResults: Template[];
  initialQuery: string;
  serverTimestamp: string;
}

export default function TemplatePage({ initialResults, initialQuery, serverTimestamp }: TemplatePageProps) {
  const [results, setResults] = useState(initialResults);

  // Clean URL-synchronized search state with smart loading animation
  const { query, setQuery, clearSearch, isSearching } = useSearchState(
    'q',
    initialQuery,
    useCallback(async (searchQuery: string) => {
      try {
        const searchResults = await searchTemplates(searchQuery, 20);
        setResults(searchResults.templates);
      } catch (error) {
        console.error('❌ Search failed:', error);
        setResults([]);
      }
    }, []), // Empty deps to prevent re-creation
    { loadingDelay: 50 }, // Show loading animation only if search takes longer than 50ms
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

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
                    value={query}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 text-lg bg-white text-slate-900 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    autoFocus
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
          <div className="max-w-7xl mx-auto">
            <TemplateResults results={results} isLoading={isSearching} query={query} />
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-8 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>Server render time: {serverTimestamp}</div>
                <div>Searching: {isSearching ? 'Yes' : 'No'}</div>
                <div>Initial query: &ldquo;{initialQuery}&rdquo;</div>
                <div>Current query: &ldquo;{query}&rdquo;</div>
                <div>Results: {results.length}</div>
                <div>Data source: {query === initialQuery ? '🏗️ SSR' : '🔥 Client-side'}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TemplatePageProps> = async ({ query }) => {
  const searchQuery = (query.q as string) || '';
  const searchResults = await searchTemplates(searchQuery, 20);
  return {
    props: {
      initialResults: searchResults.templates,
      initialQuery: searchQuery,
      serverTimestamp: new Date().toISOString(),
    },
  };
};
