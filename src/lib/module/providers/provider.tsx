import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { Module } from '../core';

interface ProviderConfig<TInput, TOutput> extends Module<TInput, TOutput> {
  errorHandler?: (error: unknown) => string;
  loadingMessage?: string;
  errorTitle?: string;
}

interface ModuleContext<TOutput> {
  isLoading: boolean;
  error: string | null;
  resource: TOutput;
}

interface ModuleProviderProps<TInput> {
  config: TInput;
  children: ReactNode;
}

function createModuleProvider<TInput, TOutput>(config: ProviderConfig<TInput, TOutput>) {
  const { name, builder, errorHandler, loadingMessage = 'Loading...', errorTitle = `Module ${name} Error` } = config;

  const Context = createContext<ModuleContext<TOutput> | null>(null);

  function toErrorMessage(err: unknown): string {
    console.error(`${name} initialization error:`, err);
    if (errorHandler) return errorHandler(err);
    if (err instanceof Error) return err.message;
    return `Failed to initialize ${name}`;
  }

  type Built = { resource: TOutput } | { error: string } | { pending: Promise<TOutput> };

  function ModuleProvider({ config: moduleConfig, children }: ModuleProviderProps<TInput>) {
    const configKey = JSON.stringify(moduleConfig);

    // Build during render, so a synchronous builder's resource is ready on the
    // server and the tree below (pages and their <head> tags) server-renders.
    // biome-ignore lint/correctness/useExhaustiveDependencies: require JSON for stable comparison
    const built = useMemo<Built>(() => {
      try {
        const result = builder(moduleConfig);
        return result instanceof Promise ? { pending: result } : { resource: result };
      } catch (err) {
        return { error: toErrorMessage(err) };
      }
    }, [configKey]);

    // An async builder can only finish on the client.
    const [settled, setSettled] = useState<{ from: Built; value: { resource: TOutput } | { error: string } }>();
    useEffect(() => {
      if (!('pending' in built)) return;
      let current = true;
      built.pending.then(
        resource => current && setSettled({ from: built, value: { resource } }),
        err => current && setSettled({ from: built, value: { error: toErrorMessage(err) } }),
      );
      return () => {
        current = false;
      };
    }, [built]);

    const state = 'pending' in built ? (settled?.from === built ? settled.value : null) : built;
    const isLoading = state === null;
    const error = state && 'error' in state ? state.error : null;
    const resource = state && 'resource' in state ? state.resource : null;

    const contextValue: ModuleContext<TOutput> = {
      resource: resource!,
      isLoading,
      error,
    };

    if (error) {
      return (
        <div
          style={{
            padding: '1rem',
            margin: '1rem',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
          }}
        >
          <h3>{errorTitle}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{error}</pre>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div
          style={{
            padding: '1rem',
            margin: '1rem',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          {loadingMessage}
        </div>
      );
    }

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  }

  function useModuleContext(): ModuleContext<TOutput> {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`useModuleContext must be used within a ${name} Provider`);
    }
    return context;
  }

  return {
    Provider: ModuleProvider,
    useContext: useModuleContext,
  };
}

export { createModuleProvider };
export type { ProviderConfig, ModuleContext, ModuleProviderProps };
