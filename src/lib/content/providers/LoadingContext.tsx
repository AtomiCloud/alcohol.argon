import React, { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface LoadingContextType {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  startIsolatedLoading: () => void;
  stopIsolatedLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

function LoadingProvider({ children }: LoadingProviderProps) {
  // Use a counter internally instead of boolean
  const [loadingCounter, setLoadingCounter] = useState<number>(0);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);

  const loading = useMemo(() => loadingCounter > 0 || loadingFlag, [loadingCounter, loadingFlag]);

  const startLoading = useCallback(() => setLoadingCounter(prev => prev + 1), []);

  const stopLoading = useCallback(() => setLoadingCounter(prev => prev - 1), []);

  const startIsolatedLoading = useCallback(() => setLoadingFlag(true), []);
  const stopIsolatedLoading = useCallback(() => setLoadingFlag(false), []);

  const providerValue = useMemo(
    () => ({ loading, startLoading, stopLoading, startIsolatedLoading, stopIsolatedLoading }),
    [loading, startLoading, stopLoading, startIsolatedLoading, stopIsolatedLoading],
  );

  return <LoadingContext.Provider value={providerValue}>{children}</LoadingContext.Provider>;
}

function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) throw new Error('useLoadingContext must be used within a LoadingProvider');
  return context;
}

export { useLoadingContext, LoadingContext, LoadingProvider, type LoadingProviderProps };
