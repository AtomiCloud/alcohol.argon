import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

type UrlStateOptions = {
  shallow?: boolean;
  replace?: boolean;
  debounceMs?: number;
};

/**
 * Hook for synchronizing a state value with URL search parameters
 * Pattern inspired by useSearchState - prevents sync loops with isInternalUpdateRef
 */
function useUrlState(paramName: string, initialValue = '', options: UrlStateOptions = {}) {
  const router = useRouter();
  const { shallow = true, replace = true, debounceMs = 300 } = options;

  // Initialize state from URL or default
  const [state, setState] = useState<string>(() => (router.query[paramName] as string) || initialValue);
  const stateRef = useRef(state);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track whether URL changes are from our own updates (prevents sync loops)
  const isInternalUpdateRef = useRef(false);
  const prevUrlValueRef = useRef<string>((router.query[paramName] as string) || '');

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = useCallback(
    (newValue: string) => {
      // Prevent unnecessary updates if value hasn't changed
      if (newValue === stateRef.current) return;

      // 1. Update local state immediately for responsive UI
      setState(newValue);

      // 2. Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 3. Debounced URL sync
      const syncToUrl = async () => {
        // Mark this as an internal update to prevent sync loop
        isInternalUpdateRef.current = true;

        const newQuery = { ...router.query };
        newQuery[paramName] = newValue;

        const routerMethod = replace ? router.replace : router.push;
        await routerMethod({ pathname: router.pathname, query: newQuery }, undefined, { shallow });
      };

      if (debounceMs > 0) {
        debounceTimerRef.current = setTimeout(syncToUrl, debounceMs);
      } else {
        syncToUrl();
      }
    },
    [paramName, router, shallow, replace, debounceMs],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Smart sync: URL → state (only for external changes, not our own updates)
  useEffect(() => {
    const urlValue = (router.query[paramName] as string) || '';

    // Check if URL value actually changed
    if (urlValue !== prevUrlValueRef.current) {
      // Only sync if this was NOT our own update
      if (!isInternalUpdateRef.current) {
        setState(urlValue);
      }
      prevUrlValueRef.current = urlValue;
      isInternalUpdateRef.current = false; // Reset flag
    }
  }, [router.query[paramName], paramName]);

  return [state, updateState] as const;
}

export { useUrlState, type UrlStateOptions };
