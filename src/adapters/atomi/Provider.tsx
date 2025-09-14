import { ReactNode, useMemo } from 'react';
import { LandscapeProvider } from '@/lib/landscape/providers';
import { envLandscapeSource } from '@/lib/landscape/core';
import {
  BridgedApiClientProvider,
  BridgedConfigProvider,
  BridgedProblemProvider,
  BridgedProblemReporterProvider,
} from './bridge';
import FrontendObservability from '../../lib/observability/FrontendObservability';

interface AtomiProviderProps {
  children: ReactNode;
}

export function AtomiProvider({ children }: AtomiProviderProps) {
  return (
    <LandscapeProvider config={{ source: envLandscapeSource }}>
      <BridgedConfigProvider>
        <BridgedProblemReporterProvider>
          <BridgedProblemProvider>
            <FrontendObservability />
            <BridgedApiClientProvider>{children}</BridgedApiClientProvider>
          </BridgedProblemProvider>
        </BridgedProblemReporterProvider>
      </BridgedConfigProvider>
    </LandscapeProvider>
  );
}
