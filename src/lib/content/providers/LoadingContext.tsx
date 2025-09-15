import React, { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

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

  const startLoading = () => setLoadingCounter(prev => prev + 1);

  const stopLoading = () => setLoadingCounter(prev => prev - 1);

  const startIsolatedLoading = () => setLoadingFlag(true);
  const stopIsolatedLoading = () => setLoadingFlag(false);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading, startIsolatedLoading, stopIsolatedLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) throw new Error('useLoadingContext must be used within an LoadingProvider');
  return context;
}

export { useLoadingContext, LoadingContext, LoadingProvider, type LoadingProviderProps };
