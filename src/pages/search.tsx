import React, { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Search, X } from 'lucide-react';
import { searchItems, SearchItem } from '@/lib/sample-data';
import { SearchResults } from '@/components/SearchResults';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchPageProps {
  initialResults: SearchItem[];
  initialQuery: string;
  serverTimestamp: string;
}

export default function SearchPage({ initialResults, initialQuery, serverTimestamp }: SearchPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Track hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!isHydrated) return; // Don't search during SSR

      setIsLoading(true);

      try {
        // Update URL query parameters
        const url = new URL(window.location.href);
        if (searchQuery.trim()) {
          url.searchParams.set('q', searchQuery);
        } else {
          url.searchParams.delete('q');
        }

        // Update URL without causing a page reload
        window.history.replaceState({}, '', url.toString());

        // Fetch search results from API
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
        const data = await response.json();

        if (response.ok) {
          setResults(data.results);
        } else {
          console.error('Search API error:', data.message);
          // Fallback to client-side search
          setResults(searchItems(searchQuery, 20));
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to client-side search
        setResults(searchItems(searchQuery, 20));
      } finally {
        setIsLoading(false);
      }
    },
    [isHydrated],
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const debouncedFn = debounce(performSearch, 300);
      debouncedFn(searchQuery);
    },
    [performSearch],
  );

  // Handle search input changes
  useEffect(() => {
    if (isHydrated) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch, isHydrated]);

  // Sync with URL changes (back/forward navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      const urlQuery = (router.query.q as string) || '';
      if (urlQuery !== query) {
        setQuery(urlQuery);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, query]);

  const handleClearSearch = () => {
    setQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <Head>
        <title>Search - Alcohol Argon</title>
        <meta name="description" content="Search for frameworks, libraries, and development tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
              Search Development Tools
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Discover frameworks, libraries, and tools for your next project
            </p>

            {/* Search Input */}
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search for React, Next.js, TypeScript..."
                    value={query}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 text-lg bg-white text-slate-900 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="max-w-7xl mx-auto">
            <SearchResults results={results} isLoading={isLoading && isHydrated} query={query} />
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-8 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>Server render time: {serverTimestamp}</div>
                <div>Hydrated: {isHydrated ? 'Yes' : 'No'}</div>
                <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                <div>Query: &ldquo;{query}&rdquo;</div>
                <div>Results: {results.length}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

// Debounce utility function
function debounce(func: (searchQuery: string) => Promise<void>, wait: number): (searchQuery: string) => void {
  let timeout: NodeJS.Timeout;
  return (searchQuery: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(searchQuery), wait);
  };
}

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async ({ query }) => {
  const searchQuery = (query.q as string) || '';
  const initialResults = searchItems(searchQuery, 20);

  return {
    props: {
      initialResults,
      initialQuery: searchQuery,
      serverTimestamp: new Date().toISOString(),
    },
  };
};
