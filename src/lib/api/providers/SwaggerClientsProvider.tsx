import React, { ReactNode, useEffect, useState } from 'react';
import { ApiTree, ClientTree, createFromClientTree } from '../core/swagger-adapter';

export interface SwaggerClientsProviderProps<T extends ClientTree> {
  clientTree: T;
  children: ReactNode;
}

interface SwaggerClientsContextValue<T extends ClientTree> {
  api: ApiTree<T>;
  isLoading: boolean;
  error: string | null;
}

const SwaggerClientsContext = React.createContext<SwaggerClientsContextValue<any> | null>(null);

export function SwaggerClientsProvider<T extends ClientTree>({ clientTree, children }: SwaggerClientsProviderProps<T>) {
  const [apiTree, setApiTree] = useState<ApiTree<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeConfiguration() {
      try {
        setIsLoading(true);
        setError(null);

        const apiTree = createFromClientTree(clientTree);
        setApiTree(apiTree);
      } catch (err) {
        let errorMessage = 'Failed to initialize Swagger Client Tree';
        setError(errorMessage);
        console.error('Swagger Client Tree initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConfiguration().then(r => console.log(r));
  }, [clientTree]);

  const contextValue: SwaggerClientsContextValue<T> = {
    api: apiTree!,
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
        <h3>Swagger Client Tree Error</h3>
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
        Loading swagger client tree...
      </div>
    );
  }

  return <SwaggerClientsContext.Provider value={contextValue}>{children}</SwaggerClientsContext.Provider>;
}

export function useSwaggerClientsContext<T extends ClientTree>(): SwaggerClientsContextValue<T> {
  const context = React.useContext(SwaggerClientsContext);
  if (!context) throw new Error('useSwaggerClientsContext must be used within a SwaggerClientsProvider');
  return context;
}
