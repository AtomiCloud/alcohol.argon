import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

type FormUrlStateOptions = {
  debounceMs?: number;
  shallow?: boolean;
  replace?: boolean;
};

/**
 * Unified form state hook that syncs multiple fields to URL with ONE router update
 * Prevents navigation loops by batching all field updates together
 */
export function useFormUrlState<T extends Record<string, string>>(defaults: T, options: FormUrlStateOptions = {}) {
  const router = useRouter();
  const { debounceMs = 300, shallow = true, replace = true } = options;

  // Initialize state from URL or defaults
  const buildInitialState = useCallback(() => {
    const result = { ...defaults };
    for (const key in defaults) {
      const urlValue = router.query[key] as string;
      if (urlValue) {
        result[key as keyof T] = urlValue as T[keyof T];
      }
    }
    return result;
  }, [defaults, router.query]);

  const [state, setState] = useState<T>(buildInitialState);
  const stateRef = useRef(state);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track internal vs external URL changes
  const isInternalUpdateRef = useRef(false);
  const prevUrlStateRef = useRef<T>(buildInitialState());

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Update one or more fields
  const updateFields = useCallback(
    (updates: Partial<T>) => {
      // 1. Update local state immediately
      setState(prev => ({ ...prev, ...updates }));

      // 2. Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 3. Debounced URL sync
      const syncToUrl = async () => {
        isInternalUpdateRef.current = true;

        const newQuery = { ...router.query };
        const newState = { ...stateRef.current };

        // Update all fields in the query
        for (const key in newState) {
          newQuery[key] = newState[key];
        }

        const routerMethod = replace ? router.replace : router.push;
        await routerMethod({ pathname: router.pathname, query: newQuery }, undefined, { shallow });
      };

      if (debounceMs > 0) {
        debounceTimerRef.current = setTimeout(syncToUrl, debounceMs);
      } else {
        syncToUrl();
      }
    },
    [router, debounceMs, shallow, replace],
  );

  // Cancel any pending debounced update
  const cancelPending = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Smart sync: URL → state (only for external changes)
  useEffect(() => {
    const urlState: T = { ...defaults };
    for (const key in defaults) {
      const urlValue = router.query[key] as string;
      if (urlValue) {
        urlState[key as keyof T] = urlValue as T[keyof T];
      }
    }

    // Check if any URL value changed
    const hasChanged = Object.keys(defaults).some(key => urlState[key] !== prevUrlStateRef.current[key]);

    if (hasChanged) {
      // Only sync if this was NOT our own update
      if (!isInternalUpdateRef.current) {
        setState(urlState);
      }
      prevUrlStateRef.current = urlState;
      isInternalUpdateRef.current = false; // Reset flag
    }
  }, [router.query, defaults]);

  // One-time initial URL sync when router is ready
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally one-time sync on mount when router is ready
  useEffect(() => {
    if (!router.isReady) return;

    const currentQuery = router.query;
    const updates: Record<string, string> = {};

    // Add missing defaults to URL
    for (const key in defaults) {
      if (!currentQuery[key] && defaults[key]) {
        updates[key] = defaults[key];
      }
    }

    // Update URL with defaults if needed (ONE update for all defaults)
    if (Object.keys(updates).length > 0) {
      isInternalUpdateRef.current = true;
      const newQuery = { ...currentQuery, ...updates };
      const routerMethod = replace ? router.replace : router.push;
      void routerMethod({ pathname: router.pathname, query: newQuery }, undefined, { shallow });
    }
  }, [router.isReady]); // Only run once when router is ready

  return {
    state,
    updateFields,
    cancelPending,
    setState,
  };
}
