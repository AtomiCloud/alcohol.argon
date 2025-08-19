import React, { ReactNode, useEffect, useState } from 'react';
import {
  ErrorReporter,
  ProblemConfig,
  ProblemDefinitions,
  ProblemRegistry,
  ProblemTransformer,
} from '@/lib/problem/core';

export interface ProblemProviderProps<T extends ProblemDefinitions> {
  config: ProblemConfig;
  problemDefinition: T;
  errorReporter: ErrorReporter;
  children: ReactNode;
}

interface ProblemContextValue<T extends ProblemDefinitions> {
  registry: ProblemRegistry<T>;
  transformer: ProblemTransformer<T>;
  isLoading: boolean;
  error: string | null;
}

const ProblemContext = React.createContext<ProblemContextValue<any> | null>(null);

export function ProblemProvider<T extends ProblemDefinitions>({
  config,
  problemDefinition,
  errorReporter,
  children,
}: ProblemProviderProps<T>) {
  const [registry, setRegistry] = useState<ProblemRegistry<T> | null>(null);
  const [transformer, setTransformer] = useState<ProblemTransformer<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeConfiguration() {
      try {
        setIsLoading(true);
        setError(null);

        const problemRegistry = new ProblemRegistry(config, problemDefinition);
        const problemTransformer = new ProblemTransformer(problemRegistry, errorReporter);

        setRegistry(problemRegistry);
        setTransformer(problemTransformer);
      } catch (err) {
        let errorMessage = 'Failed to initialize problem system';
        setError(errorMessage);
        console.error('Problem initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConfiguration().then(r => console.log(r));
  }, [config, problemDefinition, errorReporter]);

  const contextValue: ProblemContextValue<T> = {
    registry: registry!,
    transformer: transformer!,
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
        <h3>Problem System Error</h3>
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
        Loading problem sy...
      </div>
    );
  }

  return <ProblemContext.Provider value={contextValue}>{children}</ProblemContext.Provider>;
}

export function useProblemContext<T extends ProblemDefinitions>(): ProblemContextValue<T> {
  const context = React.useContext(ProblemContext);
  if (!context) throw new Error('useProblemContext must be used within a ProblemProvider');
  return context;
}
