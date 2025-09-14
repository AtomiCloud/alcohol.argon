import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Problem } from '@/lib/problem/core/types';
import type { NextComponentType, NextPageContext } from 'next';
import { useErrorContext } from '@/lib/content/providers/ErrorContext';
import { detectSerialError } from '@/lib/problem/detect-serial-error';
import { ProblemReporter } from '@/lib/problem/core';
import { ErrorComponentProps } from '@/lib/problem/core/error-page';
import { useLoadingContext } from '@/lib/content/providers';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { useEmptyContext } from '@/lib/content/providers/EmptyContext';
import { ContentEmptyFn, ContentLoaderFn } from '@/lib/content/providers/useContent';

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
