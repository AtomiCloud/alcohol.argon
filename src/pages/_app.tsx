import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { configSchemas } from '@/config';
import FrontendObservability from '@/lib/observability/FrontendObservability';
import { importedConfigurations } from '@/config/configs';
import { ConfigProvider } from '@/lib/config/providers';
import { GlobalErrorBoundary } from '@/components/error-boundary';
import { ContentManager } from '@/components/content-manager';
import { ErrorProvider } from '@/contexts/ErrorContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    // <LandscapeProvider landscapeSource={envLandscapeSource}>
    // <ConfigProvider schemas={configSchemas} importedConfigurations={importedConfigurations}>
    // <ProblemProvider problemDefinition={PROBLEM_DEFINITIONS}>
    <ErrorProvider>
      <FrontendObservability />
      <GlobalErrorBoundary>
        <Layout>
          <ContentManager Component={Component} pageProps={pageProps} />
        </Layout>
      </GlobalErrorBoundary>
    </ErrorProvider>
    // </ProblemProvider>
    // </ConfigProvider>
    // </LandscapeProvider>
  );
}
