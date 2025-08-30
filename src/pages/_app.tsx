import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { ContentManager } from '@/components/content-manager';
import { AtomiProvider } from '@/adapters/atomi/Provider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AtomiProvider>
      <Layout>
        <ContentManager Component={Component} pageProps={pageProps} />
      </Layout>
    </AtomiProvider>
  );
}
