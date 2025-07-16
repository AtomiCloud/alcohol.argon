import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { ConfigProvider } from '@/lib/config';
import { configSchemas } from '@/config';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider schemas={configSchemas}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConfigProvider>
  );
}
