import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { EmptyStateLottie, LoadingLottie } from '@/components/lottie/presets';
import { ErrorPage } from '@/components/error-page/ErrorPage';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { Layout } from '@/components/Layout';
import { ContentSystem } from '@/lib/content/components/ContentSystem';
import { useClientConfig } from '@/adapters/external/Provider';
import PlausibleProvider from 'next-plausible';
import { AtomiProvider } from '@/adapters/atomi/Provider';
import { generatedSeoConfig } from '@/lib/seo/generated-config';

function DefaultEmptyComponent({ desc }: { desc?: string }) {
  return (
    <div className="min-h-screen pt-20">
      <div className="flex flex-col items-center text-center space-y-6 p-8">
        <EmptyStateLottie />
        <div className="space-y-2">
          <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">{desc ?? 'Nothing found'}</p>
        </div>
      </div>
    </div>
  );
}

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
  const clientConfig = useClientConfig();
  const plausible = clientConfig.tracker.plausible;

  return (
    <>
      <PlausibleProvider domain={plausible.domain} enabled={plausible.enabled}>
        <ContentSystem
          Component={Component}
          pageProps={pageProps}
          LayoutComponent={Layout}
          EmptyComponent={DefaultEmptyComponent}
          LoadingComponent={DefaultLoadingComponent}
          problemReporter={problemReporter}
          ErrorComponent={ErrorPage}
        />
      </PlausibleProvider>
    </>
  );
}

export default function App(appProps: AppProps) {
  return (
    <>
      <DefaultSeo {...generatedSeoConfig} />
      <AtomiProvider>
        <AppContent {...appProps} />
      </AtomiProvider>
    </>
  );
}
