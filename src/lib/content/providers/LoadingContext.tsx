import React, { createContext, ReactNode, useContext, useState } from 'react';

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

  const startLoading = () => {
    console.log('startLoading called');
    setLoadingCounter(prev => prev + 1);
  };

  const stopLoading = () => {
    console.log('stopLoading called');
    setLoadingCounter(prev => prev - 1);
  };

  return (
    <LoadingContext.Provider
      value={{
        loading: loadingCounter > 0, // Convert counter to boolean for consumers
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within an LoadingProvider');
  }
  return context;
}

export { useLoadingContext, LoadingContext, LoadingProvider, type LoadingProviderProps };
