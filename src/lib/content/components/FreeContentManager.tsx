import type React from 'react';
import { useEffect, useState } from 'react';

export interface ContentManagerProps {
  LoadingComponent: React.ComponentType;
  EmptyComponent: React.ComponentType<{ desc?: string }>;
  loadingState: boolean;
  emptyState?: string;
  children: React.ReactNode;
}

type ContentState = 'loading' | 'content' | 'empty';

export function FreeContentManager({
  LoadingComponent,
  EmptyComponent,
  loadingState,
  emptyState,
  children,
}: ContentManagerProps) {
  const [state, setState] = useState<ContentState>('loading');
  useEffect(() => {
    setState('content');
    if (emptyState) setState('empty');
    if (loadingState) setState('loading');
  }, [loadingState, emptyState]);
  return (
    <>
      <div className={state === 'content' ? '' : 'hidden'}>{children}</div>
      {state === 'empty' ? <EmptyComponent desc={emptyState} /> : <></>}
      {state === 'loading' ? <LoadingComponent /> : <></>}
    </>
  );
}
