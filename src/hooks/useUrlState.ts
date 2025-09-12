import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Hook for synchronizing a state value with URL search parameters
 * Handles both programmatic updates and browser navigation
 */
export function useUrlState(
  paramName: string,
  initialValue = '',
  options: {
    shallow?: boolean;
    replace?: boolean;
  } = {},
) {
  const router = useRouter();
  const { shallow = true, replace = true } = options;

  // Initialize state from router.query for consistency with SSR
  const [state, setState] = useState(() => {
    // Use router.query for consistency (will be initialValue during SSR)
    return (router.query[paramName] as string) || initialValue;
  });

  // Update URL when state changes
  const updateState = useCallback(
    (newValue: string) => {
      setState(newValue);

      // Build new query object
      const newQuery = { ...router.query };
      if (newValue.trim()) {
        newQuery[paramName] = newValue;
      } else {
        delete newQuery[paramName];
      }

      // Use router to update URL
      if (replace) {
        router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow });
      } else {
        router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow });
      }
    },
    [paramName, router, shallow, replace],
  );

  // Sync with URL changes (back/forward navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      const urlValue = (router.query[paramName] as string) || '';
      setState(urlValue);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router, paramName]); // Removed state from deps to prevent loops

  // Sync state with router.query changes (including initial hydration)
  useEffect(() => {
    const urlValue = (router.query[paramName] as string) || '';
    setState(urlValue);
  }, [router.query, paramName]); // Removed state from deps to prevent loops

  return [state, updateState] as const;
}

/**
 * Hook for search functionality with URL synchronization
 * Combines useUrlState with search-specific logic and smart loading states
 */
export function useSearchState(
  paramName = 'q',
  initialValue = '',
  onSearch?: (query: string) => void | Promise<void>,
  options: {
    loadingDelay?: number; // Delay in ms before showing loading state
  } = {},
) {
  const { loadingDelay } = options;
  const [query, setQuery] = useUrlState(paramName, initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const hasSearchedRef = useRef(false);
  const lastQueryRef = useRef(initialValue);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchRef = useRef(onSearch);

  // Keep onSearch ref up to date
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Trigger search when query changes
  useEffect(() => {
    if (!onSearchRef.current) return;

    // Skip if query hasn't actually changed
    if (query === lastQueryRef.current) return;

    // Skip first search if it matches initial value (already rendered by SSR)
    if (!hasSearchedRef.current && query === initialValue) {
      hasSearchedRef.current = true;
      lastQueryRef.current = query;
      return;
    }

    const performSearch = async () => {
      // Only show loading state if search takes longer than expected
      loadingTimeoutRef.current = setTimeout(() => {
        setIsSearching(true);
      }, loadingDelay);

      try {
        await onSearchRef.current?.(query);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        // Clear timeout and loading state
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        setIsSearching(false);
        hasSearchedRef.current = true;
        lastQueryRef.current = query;
      }
    };

    performSearch();
  }, [query, initialValue, loadingDelay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, [setQuery]);

  return {
    query,
    setQuery,
    clearSearch,
    isSearching,
  };
}
