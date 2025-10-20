import { useCallback, useEffect, useRef, useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { CausePrincipalRes, CharityPrincipalRes } from '@/clients/alcohol/zinc/api';
import type { ResultSerial } from '@/lib/monads/result';
import { Res } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import { ChevronDown, ExternalLink, Filter, Globe, Search } from 'lucide-react';
import { useSearchState } from '@/lib/urlstate/useSearchState';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import { FreeContentManager } from '@/lib/content/components/FreeContentManager';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type SearchQuery = { q: string; country: string; cause: string };

type FilterOptionsData = {
  countries: string[];
  causes: CausePrincipalRes[];
};

type CharitiesPageProps = {
  initialResults: ResultSerial<CharityPrincipalRes[], Problem>;
  filterOptions: ResultSerial<FilterOptionsData, Problem>;
  initialQuery: SearchQuery;
};

export default function CharitiesPage({ initialResults, filterOptions, initialQuery }: CharitiesPageProps) {
  const api = useSwaggerClients();
  const router = useRouter();

  // Check if we're in selection mode (returnTo query param)
  const returnTo = router.query.returnTo as string | undefined;
  const returnCharityParam = router.query.returnCharityParam as string | undefined;
  const isSelectionMode = !!returnTo;

  // Filter options (countries and causes) - loaded once from SSR
  const [filterData] = useState(() => Res.fromSerial<FilterOptionsData, Problem>(filterOptions));
  const [countries, setCountries] = useState<string[]>([]);
  const [causes, setCauses] = useState<CausePrincipalRes[]>([]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [causeOpen, setCauseOpen] = useState(false);

  // Search results - following template pattern
  const [results, setResults] = useState(Res.fromSerial<CharityPrincipalRes[], Problem>(initialResults));

  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();

  // Use content hook to handle Result matching automatically
  const content = useContent(results, {
    loaderDelay: 25,
    notFound: 'No charities found',
    loader,
    empty,
  });

  // Extract filter options from initial data
  useEffect(() => {
    filterData.map(d => {
      setCountries(d.countries);
      setCauses([...d.causes].sort((a, b) => (a.name || a.key || '').localeCompare(b.name || b.key || '')));
    });
  }, [filterData]);

  // Search handler that executes search - following template pattern
  const handleSearch = useCallback(
    async (params: SearchQuery) =>
      setResults(
        await api.alcohol.zinc.api.vCharityList({
          version: '1.0',
          Name: params.q || undefined,
          Country: params.country || undefined,
          CauseKey: params.cause || undefined,
          Limit: 50,
          Skip: 0,
        }),
      ),
    [api],
  );

  // URL state sync with search - initialize with server query
  const { query, setQuery, clearSearch } = useSearchState(
    {
      q: initialQuery.q,
      country: initialQuery.country,
      cause: initialQuery.cause,
    },
    handleSearch,
    {
      debounceMs: 100,
      validators: {
        q: (value: string) => value.length >= 0, // Allow any query including empty
        country: (value: string) => value.length >= 0, // Allow any country including empty
        cause: (value: string) => value.length >= 0, // Allow any cause including empty
      },
    },
  );

  const handleSelectCharity = useCallback(
    (charityId: string) => {
      if (!isSelectionMode || !returnTo || !charityId) return;

      // Parse returnTo URL and update/add the charity param
      const paramName = returnCharityParam || 'charityId';
      const url = new URL(returnTo, window.location.origin);

      // Remove existing param if it exists (to avoid creating an array)
      url.searchParams.delete(paramName);

      // Add the new charity ID
      url.searchParams.set(paramName, charityId);

      const targetPath = url.pathname + url.search;

      router.push(targetPath);
    },
    [isSelectionMode, returnTo, returnCharityParam, router],
  );

  // Filter dropdown component using Popover
  function FilterSelect<T extends string | { key?: string | null; name?: string | null }>(props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: T[];
    getKey: (t: T) => string;
    getLabel: (t: T) => string;
    open: boolean;
    setOpen: (v: boolean) => void;
    placeholder?: string;
  }) {
    const { label, value, onChange, options, getKey, getLabel, open, setOpen, placeholder } = props;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const selected = options.find(o => getKey(o) === value);
    const display = selected ? getLabel(selected) : placeholder || label;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${label.toLowerCase()}-dropdown`}
            className="w-full h-10 px-3 rounded-md bg-transparent border border-input text-sm inline-flex items-center justify-between gap-2 cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <span className="truncate text-left flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 opacity-70" /> {display}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={`${label.toLowerCase()}-dropdown`}
          className="p-0 w-[min(92vw,20rem)]"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter>
            <CommandInput ref={inputRef} placeholder={`Search ${label.toLowerCase()}...`} autoFocus />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No results</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="__any__"
                  value="Any"
                  onSelect={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  Any
                </CommandItem>
                {options.map(it => {
                  const key = getKey(it);
                  const lbl = getLabel(it);
                  return (
                    <CommandItem
                      key={key}
                      value={lbl}
                      onSelect={() => {
                        onChange(key);
                        setOpen(false);
                      }}
                    >
                      {lbl}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  function CauseSelect(props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: CausePrincipalRes[];
    open: boolean;
    setOpen: (v: boolean) => void;
    placeholder?: string;
  }) {
    const { label, value, onChange, options, open, setOpen, placeholder } = props;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const selected = options.find(o => (o.key || '') === value);
    const display = selected?.name || selected?.key || placeholder || label;

    const toSegments = (s: string) =>
      s
        .split('>')
        .map(p => p.trim())
        .filter(Boolean);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${label.toLowerCase()}-dropdown`}
            className="w-full h-10 px-3 rounded-md bg-transparent border border-input text-sm inline-flex items-center justify-between gap-2 cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <span className="truncate text-left flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 opacity-70" /> {display || 'Any'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={`${label.toLowerCase()}-dropdown`}
          className="p-0 w-[min(92vw,20rem)]"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter>
            <CommandInput ref={inputRef} placeholder={`Search ${label.toLowerCase()}...`} autoFocus />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No results</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="__any__"
                  value="Any"
                  onSelect={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  Any
                </CommandItem>
                {options.map(it => {
                  const name = it.name || it.key || '';
                  const segs = toSegments(name);
                  const depth = Math.max(0, segs.length - 1);
                  const leaf = segs[segs.length - 1] || name;
                  return (
                    <CommandItem
                      key={it.key || name}
                      value={name}
                      onSelect={() => {
                        onChange(it.key || '');
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        <span style={{ marginLeft: depth * 12 }} className="text-xs">
                          {leaf}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <Head>
        <title>{isSelectionMode ? 'Select Charity' : 'Charities'} - LazyTax</title>
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Search className="w-8 h-8" />
            {isSelectionMode ? 'Select a Charity' : 'Charities'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {isSelectionMode
              ? 'Search and select a charity to support'
              : 'Browse and search charities to support with LazyTax'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search charities by name..."
              value={query.q}
              onChange={e => setQuery({ ...query, q: e.target.value })}
              className="pl-10 h-12"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FilterSelect
              label="Country"
              value={query.country}
              onChange={v => setQuery({ ...query, country: v })}
              options={countries}
              getKey={c => c as string}
              getLabel={c => c as string}
              open={countryOpen}
              setOpen={setCountryOpen}
              placeholder="Country: Any"
            />
            <CauseSelect
              label="Cause"
              value={query.cause}
              onChange={v => setQuery({ ...query, cause: v })}
              options={causes}
              open={causeOpen}
              setOpen={setCauseOpen}
              placeholder="Cause: Any"
            />
          </div>

          {(query.q || query.country || query.cause) && (
            <Button variant="outline" size="sm" onClick={clearSearch} className="w-full sm:w-auto">
              Clear filters
            </Button>
          )}
        </div>

        {/* Charity List */}
        <FreeContentManager
          LoadingComponent={() => (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-slate-600 dark:text-slate-400">Searching charities...</p>
              </div>
            </div>
          )}
          EmptyComponent={({ desc }: { desc?: string }) => (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          )}
          loadingState={loading}
          emptyState={desc}
        >
          {content && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.map(charity => (
                <Card key={charity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                          {charity.name || 'Unknown'}
                        </h3>
                        {charity.websiteUrl && (
                          <a
                            href={charity.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:underline shrink-0"
                            onClick={e => e.stopPropagation()}
                          >
                            <Globe className="h-3.5 w-3.5" /> <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {charity.mission && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{charity.mission}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {Array.isArray(charity.countries) && charity.countries.length > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {charity.countries.slice(0, 2).join(', ')}
                            {charity.countries.length > 2 ? ` +${charity.countries.length - 2}` : ''}
                          </Badge>
                        )}
                      </div>

                      {isSelectionMode && charity.id && (
                        <Button
                          type="button"
                          onClick={() => handleSelectCharity(charity.id!)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </FreeContentManager>

        {isSelectionMode && (
          <div className="mt-6">
            <Button type="button" variant="outline" onClick={() => router.push(returnTo)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'public' },
  async (context, { apiTree }): Promise<GetServerSidePropsResult<CharitiesPageProps>> => {
    const api = apiTree.alcohol.zinc.api;

    // Read query params from URL
    const searchQuery = (context.query.q as string) || '';
    const countryQuery = (context.query.country as string) || '';
    const causeQuery = (context.query.cause as string) || '';

    // Load pre-filtered charities and filter options in parallel
    const [charitiesResult, countriesResult, causesResult] = await Promise.all([
      api.vCharityList({
        version: '1.0',
        Name: searchQuery || undefined,
        Country: countryQuery || undefined,
        CauseKey: causeQuery || undefined,
        Limit: 50,
        Skip: 0,
      }),
      api.vCharitySupportedCountriesList({ version: '1.0' }),
      api.vCausesList({ version: '1.0' }),
    ]);

    // Serialize results separately - following template pattern
    const initialResults: ResultSerial<CharityPrincipalRes[], Problem> = await charitiesResult.serial();

    const filterOptions: ResultSerial<FilterOptionsData, Problem> = await countriesResult
      .andThen(countries =>
        causesResult.map(causes => ({
          countries,
          causes,
        })),
      )
      .serial();

    return {
      props: {
        initialResults,
        filterOptions,
        initialQuery: { q: searchQuery, country: countryQuery, cause: causeQuery },
      },
    };
  },
);
