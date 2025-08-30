import { ReactNode } from 'react';
import { LandscapeProvider } from '@/lib/landscape/providers';
import { envLandscapeSource } from '@/lib/landscape/core';
import {
  BridgedApiClientProvider,
  BridgedConfigProvider,
  BridgedProblemProvider,
  BridgedProblemReporterProvider,
} from './bridge';
import { ErrorPage } from '@/components/error-page/ErrorPage';
import { ErrorProvider } from '@/contexts/ErrorContext';
import FrontendObservability from '../../lib/observability/FrontendObservability';
import { GlobalErrorBoundary } from '@/adapters/components/GlobalErrorBoundary';

interface AtomiProviderProps {
  children: ReactNode;
}

export function AtomiProvider({ children }: AtomiProviderProps) {
  return (
    <LandscapeProvider config={{ source: envLandscapeSource }}>
      <BridgedConfigProvider>
        <BridgedProblemReporterProvider>
          <BridgedProblemProvider>
            <GlobalErrorBoundary ErrorComponent={ErrorPage}>
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
