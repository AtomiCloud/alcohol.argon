import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { ContentManager } from '@/lib/problem/components';
import { AtomiProvider } from '@/adapters/atomi/Provider';
import { LoadingLottie } from '@/components/lottie/presets';
import { ErrorPage } from '@/components/error-page/ErrorPage';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';

function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen pt-20">
      <div className="flex flex-col items-center text-center space-y-6 p-8">
        <LoadingLottie />
        <div className="space-y-2">
          <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">Loading...</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we load the content!</p>
        </div>
      </div>
    </div>
  );
}

function AppContent({ Component, pageProps }: AppProps) {
  const problemReporter = useProblemReporter();

  return (
    <Layout>
      <ContentManager
        Component={Component}
        pageProps={pageProps}
        problemReporter={problemReporter}
        LoadingComponent={DefaultLoadingComponent}
        ErrorComponent={ErrorPage}
      />
    </Layout>
  );
}

export default function App(appProps: AppProps) {
  return (
    <AtomiProvider>
      <AppContent {...appProps} />
    </AtomiProvider>
  );
}
