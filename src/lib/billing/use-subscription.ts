import { useCallback } from 'react';
import { useProblemRegistry, useSwaggerClients } from '@/adapters/external/Provider';
import type { SubscriptionRes } from '@/clients/alcohol/zinc/api';
import { useUserId } from '@/lib/auth/use-user';
import type { Result } from '@/lib/monads/result';
import { Err } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import type { PaidTier, Tier } from '@/lib/billing/pricing';

export interface UseSubscriptionActions {
  /** Subscribe to a paid tier (charges immediately). */
  subscribe: (tier: PaidTier) => Promise<Result<SubscriptionRes, Problem>>;
  /** Stop renewal at period end; access is retained until then. */
  cancel: () => Promise<Result<SubscriptionRes, Problem>>;
  /** Upgrade (immediate charge, period resets) or downgrade (applies at period end). */
  changeTier: (tier: Tier) => Promise<Result<SubscriptionRes, Problem>>;
  /**
   * Undo a pending cancel-at-period-end: zinc has no dedicated un-cancel
   * endpoint — re-subscribing to the current tier flips the flag free of charge.
   */
  unCancel: (currentTier: PaidTier) => Promise<Result<SubscriptionRes, Problem>>;
}

export function useSubscription(): UseSubscriptionActions {
  const api = useSwaggerClients();
  const userId = useUserId();
  const problemRegistry = useProblemRegistry();

  const notSignedIn = useCallback((): Problem => problemRegistry.createProblem('unauthorized', {}), [problemRegistry]);

  const subscribe = useCallback(
    async (tier: PaidTier): Promise<Result<SubscriptionRes, Problem>> => {
      if (!userId) return Err(notSignedIn());
      return api.alcohol.zinc.api.vSubscriptionSubscribeCreate({ version: '1.0', userId }, { tier });
    },
    [api, userId, notSignedIn],
  );

  const cancel = useCallback(async (): Promise<Result<SubscriptionRes, Problem>> => {
    if (!userId) return Err(notSignedIn());
    return api.alcohol.zinc.api.vSubscriptionCancelCreate({ version: '1.0', userId });
  }, [api, userId, notSignedIn]);

  const changeTier = useCallback(
    async (tier: Tier): Promise<Result<SubscriptionRes, Problem>> => {
      if (!userId) return Err(notSignedIn());
      return api.alcohol.zinc.api.vSubscriptionChangeTierCreate({ version: '1.0', userId }, { tier });
    },
    [api, userId, notSignedIn],
  );

  const unCancel = useCallback((currentTier: PaidTier) => subscribe(currentTier), [subscribe]);

  return { subscribe, cancel, changeTier, unCancel };
}
