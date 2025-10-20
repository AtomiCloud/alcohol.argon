import { useCallback } from 'react';
import { useFormUrlState } from './useFormUrlState';
import { useRouter } from 'next/router';

/**
 * Enhanced form URL state hook with dual update methods
 *
 * Provides two update methods:
 * - updateField: Debounced (300ms) - for text inputs that change frequently
 * - updateFieldImmediate: No debounce - for selectors/pickers that change on callback
 *
 * @example
 * ```ts
 * const { state, updateField, updateFieldImmediate } = useEnhancedFormUrlState({
 *   task: '',
 *   charity: '',
 *   amount: ''
 * });
 *
 * // Text input - debounced URL sync
 * <Input
 *   value={state.task}
 *   onChange={(e) => updateField({ task: e.target.value })}
 * />
 *
 * // Selector - immediate URL sync
 * <CharitySelector
 *   value={state.charity}
 *   onChange={(id) => updateFieldImmediate({ charity: id })}
 * />
 * ```
 */
export function useEnhancedFormUrlState<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();

  // Main state manager with debouncing
  const { state, updateFields, cancelPending, setState } = useFormUrlState(defaults, {
    debounceMs: 150,
    shallow: true,
    replace: true,
  });

  // Immediate update (bypasses debounce) for selectors
  const updateFieldImmediate = useCallback(
    async (updates: Partial<T>) => {
      // 1. Cancel any pending debounced update to prevent it from clobbering our immediate change
      cancelPending();

      // 2. Update local state immediately (keeps state and URL in sync)
      setState(prev => ({ ...prev, ...updates }));

      // 3. Build new query from current state + updates (not just router.query which may be stale)
      const newQuery = { ...router.query };
      const mergedState = { ...state, ...updates };

      // Apply all state fields to query
      for (const key in mergedState) {
        newQuery[key] = mergedState[key];
      }

      // 4. Immediate router update
      await router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
    },
    [router, state, cancelPending, setState],
  );

  return {
    state,
    updateField: updateFields, // Debounced updates (for text inputs)
    updateFieldImmediate, // Immediate updates (for selectors)
  };
}
