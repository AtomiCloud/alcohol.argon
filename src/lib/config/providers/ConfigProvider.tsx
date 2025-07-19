import React, { ReactNode, useEffect, useState } from 'react';
import { ConfigRegistry, ConfigSchemas } from '../core/registry';
import { ConfigurationFactory, DEFAULT_VALIDATOR_CONFIG } from '../core/factory';
import { isConfigValidationError, ConfigurationValidator } from '../core/validator';
import { ImportedConfigurations } from '../core/loader';

export interface ConfigProviderProps<T extends ConfigSchemas> {
  schemas: T;
  importedConfigurations: ImportedConfigurations;
  children: ReactNode;
}

interface ConfigContextValue<T extends ConfigSchemas> {
  registry: ConfigRegistry<T>;
  isLoading: boolean;
  error: string | null;
}

const ConfigContext = React.createContext<ConfigContextValue<any> | null>(null);

export function ConfigProvider<T extends ConfigSchemas>({
  schemas,
  importedConfigurations,
  children,
}: ConfigProviderProps<T>) {
  const [registry, setRegistry] = useState<ConfigRegistry<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeConfiguration() {
      try {
        setIsLoading(true);
        setError(null);

        // Create configuration manager and registry via factory
        const configManager = ConfigurationFactory.createManager<T>();
        const configRegistry = configManager.createRegistry(schemas, importedConfigurations);

        setRegistry(configRegistry);
      } catch (err) {
        let errorMessage = 'Failed to initialize configuration';

        if (isConfigValidationError(err)) {
          const validator = new ConfigurationValidator(DEFAULT_VALIDATOR_CONFIG);
          errorMessage = validator.formatError(err);
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Configuration initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConfiguration();
  }, [schemas]);

  const contextValue: ConfigContextValue<T> = {
    registry: registry!,
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
        <h3>Configuration Error</h3>
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
        Loading configuration...
      </div>
    );
  }

  return <ConfigContext.Provider value={contextValue}>{children}</ConfigContext.Provider>;
}

export function useConfigContext<T extends ConfigSchemas>(): ConfigContextValue<T> {
  const context = React.useContext(ConfigContext);

  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }

  return context;
}
