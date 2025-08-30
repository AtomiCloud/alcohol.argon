import { ReactNode } from 'react';
import { LandscapeProvider } from '@/lib/landscape/providers';
import { envLandscapeSource } from '@/lib/landscape/core';
import {
  BridgedApiClientProvider,
  BridgedConfigProvider,
  BridgedProblemProvider,
  BridgedProblemReporterProvider,
} from './bridge';
import { GlobalErrorBoundary } from '@/components/error-boundary';
import { ErrorProvider } from '@/contexts/ErrorContext';
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
            <GlobalErrorBoundary>
              <ErrorProvider>
                <FrontendObservability />
                <BridgedApiClientProvider>{children}</BridgedApiClientProvider>
              </ErrorProvider>
            </GlobalErrorBoundary>
          </BridgedProblemProvider>
        </BridgedProblemReporterProvider>
      </BridgedConfigProvider>
    </LandscapeProvider>
  );
}
