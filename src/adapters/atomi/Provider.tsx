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
import { ErrorProvider } from '@/lib/content/providers/ErrorContext';
import FrontendObservability from '../../lib/observability/FrontendObservability';
import { GlobalErrorBoundary } from '@/adapters/components/GlobalErrorBoundary';
import { LoadingProvider } from '@/lib/content/providers/LoadingContext';

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
              <LoadingProvider>
                <ErrorProvider>
                  <FrontendObservability />
                  <BridgedApiClientProvider>{children}</BridgedApiClientProvider>
                </ErrorProvider>
              </LoadingProvider>
            </GlobalErrorBoundary>
          </BridgedProblemProvider>
        </BridgedProblemReporterProvider>
      </BridgedConfigProvider>
    </LandscapeProvider>
  );
}
