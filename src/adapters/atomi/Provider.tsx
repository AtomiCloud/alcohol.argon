import type { ReactNode } from 'react';
import { LandscapeProvider } from '@/lib/landscape/providers';
import { envLandscapeSource } from '@/lib/landscape/core';
import { BridgedApiClientProvider, BridgedProblemProvider, BridgedProblemReporterProvider } from './bridge';
import FrontendObservability from '../../lib/observability/FrontendObservability';
import { ThemeProvider } from '@/lib/theme/provider';
import Tracker from '@/lib/tracker/Tracker';
import { ConfigProvider } from '@/adapters/external/Provider';
import type { PublicConfig } from '@/config/public';

interface AtomiProviderProps {
  children: ReactNode;
  publicConfig?: PublicConfig;
}

export function AtomiProvider({ children, publicConfig }: AtomiProviderProps) {
  return (
    <LandscapeProvider config={{ source: envLandscapeSource }}>
      <ConfigProvider config={publicConfig ?? (process.env.BUILD_TIME_PUBLIC_CONFIG as unknown as PublicConfig)}>
        <Tracker />
        <BridgedProblemReporterProvider>
          <BridgedProblemProvider>
            <FrontendObservability />
            <BridgedApiClientProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </BridgedApiClientProvider>
          </BridgedProblemProvider>
        </BridgedProblemReporterProvider>
      </ConfigProvider>
    </LandscapeProvider>
  );
}
