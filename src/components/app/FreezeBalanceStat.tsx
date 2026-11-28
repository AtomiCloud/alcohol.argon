import { useCallback, useEffect, useRef, useState } from 'react';
import { Snowflake } from 'lucide-react';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { ProtectionBalanceRes } from '@/clients/alcohol/zinc/api';
import type { ResultSerial } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

// What the stat shows. `stale` keeps the last good balance after a refresh fails, and says so.
export type FreezeBalanceState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ok'; balance: number; cap: number; stale: boolean };

export function freezeBalanceFrom(result: ResultSerial<ProtectionBalanceRes, Problem>): FreezeBalanceState {
  return result[0] === 'ok'
    ? { kind: 'ok', balance: result[1].balance, cap: result[1].cap, stale: false }
    : { kind: 'error' };
}

// A failed refresh never turns into a number: it keeps the last balance, marked stale, or shows the error.
export function afterFailedRefresh(prev: FreezeBalanceState): FreezeBalanceState {
  return prev.kind === 'ok' ? { ...prev, stale: true } : { kind: 'error' };
}

export function FreezeBalanceView({ state, onRetry }: { state: FreezeBalanceState; onRetry: () => void }) {
  const retry = (
    <button type="button" onClick={onRetry} className="text-xs font-medium text-blue-600 dark:text-blue-400 underline">
      Retry
    </button>
  );
  return (
    <div className="flex flex-col" data-stat="freezes">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Freezes available</p>
      {state.kind === 'loading' && (
        <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" aria-label="Loading freezes" />
      )}
      {state.kind === 'error' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Balance unavailable</span>
          {retry}
        </div>
      )}
      {state.kind === 'ok' && (
        <div className="flex flex-wrap items-center gap-x-2">
          <Snowflake className="h-4 w-4 text-blue-500" />
          {state.cap <= 0 ? (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">No freezes</span>
          ) : (
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {state.balance}/{state.cap}
            </span>
          )}
          {state.stale && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              Not up to date {retry}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The signed-in user's freeze balance and cap from zinc's Protection endpoint.
 * Starts from the server-rendered result, then refetches when the page regains
 * focus and whenever `refreshKey` changes (after habit changes). Key it by user
 * so a different account never sees the previous balance.
 */
export function FreezeBalanceStat({
  userId,
  initial,
  refreshKey,
}: {
  userId: string;
  initial: ResultSerial<ProtectionBalanceRes, Problem>;
  refreshKey: number;
}) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const [state, setState] = useState<FreezeBalanceState>(() => freezeBalanceFrom(initial));

  const refresh = useCallback(async () => {
    setState(prev => (prev.kind === 'error' ? { kind: 'loading' } : prev));
    const result = await api.alcohol.zinc.api.vProtectionDetail({ version: '1.0', userId });
    await result.match({
      ok: b => setState({ kind: 'ok', balance: b.balance, cap: b.cap, stale: false }),
      err: problem => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/protection/balance',
          problem,
        });
        setState(afterFailedRefresh);
      },
    });
  }, [api, userId, problemReporter]);

  const firstKey = useRef(refreshKey);
  useEffect(() => {
    if (refreshKey !== firstKey.current) void refresh();
  }, [refreshKey, refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  return <FreezeBalanceView state={state} onRetry={() => void refresh()} />;
}
