import { useRouter } from 'next/router';
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeQueryWithDefaults, queryEqual, useRefWrap } from './util';

type SearchStateValidators<T extends Record<string, string>> = Record<keyof T, (value: string) => boolean>;

type SearchStateOptions<T extends Record<string, string>> = {
  /**
   * Debounce delay in milliseconds for URL sync
   * Default: 0 (no debouncing)
   */
  debounceMs?: number;
  /**
   * Validators for each query parameter
   * Only valid values are synced to URL and trigger searches
   * Invalid values stay in local state until corrected
   */
  validators?: Partial<SearchStateValidators<T>>;
};

type OnSearch<T extends Record<string, string>> = (query: T) => void | Promise<void>;

/**
 * Hook for search functionality with URL synchronization and validation
 *
 * Features:
 * - Immediate local state updates for responsive UI
 * - Debounced + validated URL sync
 * - Smart sync logic (prevents overwriting user input)
 * - Search triggers only on URL changes (validated state)
 */
export function useSearchState<T extends Record<string, string>>(
  params: T,
  onSearch?: OnSearch<T>,
  options?: SearchStateOptions<T>,
) {
  const { debounceMs = 0, validators } = options ?? {};

  // sync URL => local
  // this only happens when internalUpdateReference is marked false
  const { setLocalQuery, localQuery, urlQuery, isInternalUpdateRef } = useUrlToLocalSync(params);
  // sync local => URL
  // this only happens if the local state is valid and after debounces
  // this will mark isInternalUpdateRef as true
  const { setQuery, clearSearch } = useLocalToUrlSync(setLocalQuery, isInternalUpdateRef, validators ?? {}, debounceMs);

  // this will trigger search logic URL changes
  useSearchLogic(urlQuery, params, onSearch);

  return {
    query: localQuery,
    setQuery,
    clearSearch,
  };
}

// === Helper Hooks ===
/**
 * Manages local and URL query state with smart syncing
 */
function useUrlToLocalSync<T extends Record<string, string>>(params: T) {
  // utilities
  const isEqual = useCallback(queryEqual, []);
  const router = useRouter();

  // Build relevant query from router
  const buildQueryFromRouter = useCallback(() => mergeQueryWithDefaults(params, router.query), [params, router.query]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: we need the re-render
  const urlQuery = useMemo(buildQueryFromRouter, [buildQueryFromRouter]);

  // Local state
  const [localQuery, setLocalQuery] = useState<T>(buildQueryFromRouter);

  // Track internal vs external URL changes
  const isInternalUpdateRef = useRef(false);
  const prevUrlQueryRef = useRef<T>(urlQuery);

  // Smart sync: URL → local (only for external changes)
  useEffect(() => {
    if (!isEqual(urlQuery, prevUrlQueryRef.current)) {
      if (!isInternalUpdateRef.current) setLocalQuery(urlQuery);
      prevUrlQueryRef.current = urlQuery;
      isInternalUpdateRef.current = false;
    }
  }, [urlQuery, isEqual]);

  return {
    localQuery,
    urlQuery,
    setLocalQuery,
    isInternalUpdateRef,
  };
}

/**
 * Handles validation logic for query updates
 */
function useValidationLogic<T extends Record<string, string>>(validators?: Partial<SearchStateValidators<T>>) {
  const isValidUpdate = useCallback(
    (updates: Partial<T>): boolean => {
      return Object.entries(updates).every(([key, value]) => {
        const validator = validators?.[key];
        return !validator || validator(value as string);
      });
    },
    [validators],
  );

  return { isValidUpdate };
}

/**
 * Handles syncing between local state and URL with debouncing
 */
function useLocalToUrlSync<T extends Record<string, string>>(
  setLocalQuery: (i: (t: T) => T) => void,
  isInternalUpdateRef: RefObject<boolean>,
  validators: Partial<SearchStateValidators<T>>,
  debounceMs: number,
) {
  const router = useRouter();
  const validation = useValidationLogic(validators);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setLocalQueryRef = useRefWrap(setLocalQuery);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const setQuery = useCallback(
    (updates: Partial<T>) => {
      // 1. Update local state immediately
      setLocalQueryRef.current(current => ({ ...current, ...updates }));

      // 2. Clear existing debounce
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

      // 3. Debounced URL sync (only if valid)
      const syncToUrl = async () => {
        if (!validation.isValidUpdate(updates)) return;

        isInternalUpdateRef.current = true;
        const newQuery = { ...router.query };

        for (const [key, value] of Object.entries(updates)) newQuery[key] = value;

        await router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
      };

      // actual sync to URL
      if (debounceMs > 0) {
        debounceTimeoutRef.current = setTimeout(syncToUrl, debounceMs);
      } else {
        syncToUrl().then();
      }
    },
    [router, debounceMs, validation.isValidUpdate, isInternalUpdateRef, setLocalQueryRef],
  );

  const clearSearch = useCallback(() => {
    const newQuery = { ...router.query };
    // Remove all search params (set to empty, don't delete)
    for (const key in router.query) newQuery[key] = '';
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  }, [router]);

  return { setQuery, clearSearch };
}

/**
 * Handles search execution logic
 */
function useSearchLogic<T extends Record<string, string>>(urlQuery: T, params: T, onSearch?: OnSearch<T>) {
  const onSearchRef = useRefWrap(onSearch);

  const hasSearchedRef = useRef(false);
  const lastUrlQueryRef = useRef<T>(params);

  const isEqual = useCallback(queryEqual, []);

  // Trigger search when URL changes
  useEffect(() => {
    if (!onSearchRef.current) return;
    if (isEqual(urlQuery, lastUrlQueryRef.current)) return;

    // Skip the first search if matches initial params (SSR)
    if (!hasSearchedRef.current && isEqual(urlQuery, params)) {
      hasSearchedRef.current = true;
      lastUrlQueryRef.current = urlQuery;
      return;
    }

    const performSearch = async () => {
      await onSearchRef.current?.(urlQuery);
      hasSearchedRef.current = true;
      lastUrlQueryRef.current = urlQuery;
    };

    performSearch().catch(console.error);
  }, [urlQuery, params, isEqual, onSearchRef]);
}
