import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { configSchemas } from '@/config';
import FrontendObservability from '@/lib/observability/FrontendObservability';
import { importedConfigurations } from '@/config/configs';
import { ConfigProvider } from '@/lib/config/providers';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      schemas={configSchemas}
      importedConfigurations={importedConfigurations}
      landscape={process.env.LANDSCAPE || 'base'}
    >
      <FrontendObservability />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConfigProvider>
  );
}
