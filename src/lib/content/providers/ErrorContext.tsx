import React, { createContext, ReactNode, useContext, useState } from 'react';
import type { Problem } from '@/lib/problem/core/types';

interface ErrorContextType {
  currentError: Problem | null;
  setError: (error: Problem | null) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

function ErrorProvider({ children }: ErrorProviderProps) {
  const [currentError, setCurrentError] = useState<Problem | null>(null);

  const setError = (error: Problem | null) => setCurrentError(error);
  const clearError = () => setCurrentError(null);

  return <ErrorContext.Provider value={{ currentError, setError, clearError }}>{children}</ErrorContext.Provider>;
}

function useErrorContext() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

export { useErrorContext, ErrorProvider, ErrorContext };
export type { ErrorProviderProps, ErrorContextType };
