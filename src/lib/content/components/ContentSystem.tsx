import { EmptyProvider, ErrorProvider, LoadingProvider } from '@/lib/content/providers';
import { ContentManager, ContentManagerProps } from '@/lib/content/components/ContentManager';
import { GlobalErrorBoundary } from '@/adapters/components/GlobalErrorBoundary';

export function ContentSystem({
  Component,
  pageProps,
  problemReporter,
  LoadingComponent,
  EmptyComponent,
  ErrorComponent,
  LayoutComponent,
}: ContentManagerProps) {
  return (
    <GlobalErrorBoundary ErrorComponent={ErrorComponent}>
      <EmptyProvider>
        <ErrorProvider>
          <LoadingProvider>
            <ContentManager
              Component={Component}
              problemReporter={problemReporter}
              pageProps={pageProps}
              LoadingComponent={LoadingComponent}
              EmptyComponent={EmptyComponent}
              LayoutComponent={LayoutComponent}
              ErrorComponent={ErrorComponent}
            />
          </LoadingProvider>
        </ErrorProvider>
      </EmptyProvider>
    </GlobalErrorBoundary>
  );
}
