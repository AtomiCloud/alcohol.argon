import type { ReactNode } from 'react';
import { LandscapeProvider } from '@/lib/landscape/providers';
import { envLandscapeSource } from '@/lib/landscape/core';
import {
  BridgedApiClientProvider,
  BridgedConfigProvider,
  BridgedProblemProvider,
  BridgedProblemReporterProvider,
} from './bridge';
import FrontendObservability from '../../lib/observability/FrontendObservability';
import { ThemeProvider } from '@/lib/theme/provider';
import Tracker from '@/lib/tracker/Tracker';

interface AtomiProviderProps {
  children: ReactNode;
}

export function AtomiProvider({ children }: AtomiProviderProps) {
  return (
    <LandscapeProvider config={{ source: envLandscapeSource }}>
      <BridgedConfigProvider>
        <Tracker />
        <BridgedProblemReporterProvider>
          <BridgedProblemProvider>
            <FrontendObservability />
            <BridgedApiClientProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </BridgedApiClientProvider>
          </BridgedProblemProvider>
        </BridgedProblemReporterProvider>
      </BridgedConfigProvider>
    </LandscapeProvider>
  );
}
