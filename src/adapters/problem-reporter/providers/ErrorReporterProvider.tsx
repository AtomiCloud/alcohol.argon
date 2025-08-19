import React, { ReactNode, useEffect, useState } from 'react';
import { ErrorReporter } from '@/lib/problem/core';
import { ErrorReporterFactory } from '@/lib/problem/core/transformer';

export interface ErrorReporterProviderProps {
  factory: ErrorReporterFactory;
  children: ReactNode;
}

interface ErrorReporterContextValue {
  reporter: ErrorReporter;
  isLoading: boolean;
  error: string | null;
}

const ErrorReporterContext = React.createContext<ErrorReporterContextValue | null>(null);

export function ErrorReporterProvider({ factory, children }: ErrorReporterProviderProps) {
  const [reporter, setReporter] = useState<ErrorReporter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeConfiguration() {
      try {
        setIsLoading(true);
        setError(null);

        const reporter = factory.get();
        setReporter(reporter);
      } catch (err) {
        let errorMessage = 'Failed to initialize Error Reporter';
        setError(errorMessage);
        console.error('Error Reporter initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConfiguration().then(r => console.log(r));
  }, [factory]);

  const contextValue: ErrorReporterContextValue = {
    reporter: reporter!,
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
        <h3>Error Reporter Error</h3>
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
        Loading error reporter...
      </div>
    );
  }

  return <ErrorReporterContext.Provider value={contextValue}>{children}</ErrorReporterContext.Provider>;
}

export function useErrorReporterContext(): ErrorReporterContextValue {
  const context = React.useContext(ErrorReporterContext);
  if (!context) throw new Error('useErrorReporterContext must be used within a ErrorReporterProvider');
  return context;
}
