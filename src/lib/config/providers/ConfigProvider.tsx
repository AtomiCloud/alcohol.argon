import React, { ReactNode, useEffect, useState } from 'react';
import { ConfigSchemas, ValidatedConfigs, registerSchemas } from '../core/registry';
import { loadConfigurations } from '../core/loader';
import { importedConfigurations } from '../../../config/configs';
import { mergeConfigurations, processEnvironmentVariables } from '../core/merge';
import { validateAllConfigurations, isConfigValidationError, getValidationErrorMessage } from '../core/validator';

export interface ConfigProviderProps<T extends ConfigSchemas> {
  schemas: T;
  children: ReactNode;
}

interface ConfigContextValue<T extends ConfigSchemas> {
  common: ValidatedConfigs<T>['common'];
  client: ValidatedConfigs<T>['client'];
  isLoading: boolean;
  error: string | null;
}

const ConfigContext = React.createContext<ConfigContextValue<any> | null>(null);

export function ConfigProvider<T extends ConfigSchemas>({ schemas, children }: ConfigProviderProps<T>) {
  const [config, setConfig] = useState<ValidatedConfigs<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeConfiguration() {
      try {
        setIsLoading(true);
        setError(null);

        // Load raw configurations from imported YAML files
        const rawConfigs = loadConfigurations(importedConfigurations);

        // Process environment variable overrides
        const envOverrides = processEnvironmentVariables();

        // Merge configurations with environment overrides
        const mergedConfigs = {
          common: mergeConfigurations(rawConfigs.common, {}, envOverrides.common || {}),
          client: mergeConfigurations(rawConfigs.client, {}, envOverrides.client || {}),
          server: mergeConfigurations(rawConfigs.server, {}, envOverrides.server || {}),
        };

        // Validate all configurations
        const validatedConfigs = validateAllConfigurations(mergedConfigs, schemas);

        // Register schemas and validated configs globally
        registerSchemas(schemas, validatedConfigs as ValidatedConfigs<T>);

        setConfig(validatedConfigs as ValidatedConfigs<T>);
      } catch (err) {
        let errorMessage = 'Failed to initialize configuration';

        if (isConfigValidationError(err)) {
          errorMessage = getValidationErrorMessage(err);
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
    common: config?.common,
    client: config?.client,
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
