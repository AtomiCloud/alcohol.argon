import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import FrontendObservability from '@/lib/observability/FrontendObservability';
import { GlobalErrorBoundary } from '@/components/error-boundary';
import { ContentManager } from '@/components/content-manager';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { AtomiProvider } from '@/adapters/atomi/Provider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AtomiProvider>
      <GlobalErrorBoundary>
        <ErrorProvider>
          <FrontendObservability />
          <Layout>
            <ContentManager Component={Component} pageProps={pageProps} />
          </Layout>
        </ErrorProvider>
      </GlobalErrorBoundary>
    </AtomiProvider>
  );
}
