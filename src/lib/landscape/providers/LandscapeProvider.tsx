import React, { ReactNode, useEffect, useState } from 'react';
import { envLandscapeSource, LandscapeSource } from '@/lib/landscape/core';

export interface LandscapeProviderProps {
  children: ReactNode;
  landscapeSource: LandscapeSource;
}

interface LandscapeContextValue {
  landscape: string;
  isLoading: boolean;
}

const LandscapeContext = React.createContext<LandscapeContextValue | null>(null);

export function LandscapeProvider({ landscapeSource = envLandscapeSource, children }: LandscapeProviderProps) {
  const [landscape, setLandscape] = useState<string>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeConfiguration() {
      setIsLoading(true);
      setLandscape(landscapeSource());
      setIsLoading(false);
    }

    initializeConfiguration().then(r => console.log(r));
  }, [landscapeSource]);

  const contextValue: LandscapeContextValue = { landscape, isLoading };

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
        Loading landscape...
      </div>
    );
  }
  return <LandscapeContext.Provider value={contextValue}>{children}</LandscapeContext.Provider>;
}

export function useLandscapeContext(): LandscapeContextValue {
  const context = React.useContext(LandscapeContext);
  if (!context) throw new Error('useLandscapeContext must be used within a LandscapeProvider');
  return context;
}
