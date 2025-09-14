import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Module } from '../core';
import { useDebug } from '@/lib/debug';

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

  function ModuleProvider({ config: moduleConfig, children }: ModuleProviderProps<TInput>) {
    const [resource, setResource] = useState<TOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      async function initializeResource() {
        try {
          setIsLoading(true);
          setError(null);
          const builtResource = await builder(moduleConfig);
          setResource(builtResource);
        } catch (err) {
          let errorMessage = `Failed to initialize ${name}`;

          if (errorHandler) {
            errorMessage = errorHandler(err);
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }

          setError(errorMessage);
          console.error(`${name} initialization error:`, err);
        } finally {
          setIsLoading(false);
        }
      }

      initializeResource().then(() => console.debug(`${name} initialized successfully`));
    }, [JSON.stringify(moduleConfig)]);

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
