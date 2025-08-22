import { ReactNode } from 'react';
import { LandscapeProvider } from '@/lib/landscape/providers';
import { envLandscapeSource } from '@/lib/landscape/core';
import { BridgedConfigProvider, BridgedProblemProvider, BridgedProblemReporterProvider } from './bridge';

interface AtomiProviderProps {
  children: ReactNode;
}

export function AtomiProvider({ children }: AtomiProviderProps) {
  return (
    <LandscapeProvider config={{ source: envLandscapeSource }}>
      <BridgedConfigProvider>
        <BridgedProblemReporterProvider>
          <BridgedProblemProvider>{children}</BridgedProblemProvider>
        </BridgedProblemReporterProvider>
      </BridgedConfigProvider>
    </LandscapeProvider>
  );
}
