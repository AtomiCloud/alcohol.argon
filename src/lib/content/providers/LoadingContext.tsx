import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface LoadingContextType {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

function LoadingProvider({ children }: LoadingProviderProps) {
  // Use a counter internally instead of boolean
  const [loadingCounter, setLoadingCounter] = useState<number>(0);

  const loading = useMemo(() => loadingCounter > 0, [loadingCounter]);

  const startLoading = () => setLoadingCounter(prev => prev + 1);

  const stopLoading = () => setLoadingCounter(prev => prev - 1);

  return <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>{children}</LoadingContext.Provider>;
}

function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within an LoadingProvider');
  }
  return context;
}

export { useLoadingContext, LoadingContext, LoadingProvider, type LoadingProviderProps };
