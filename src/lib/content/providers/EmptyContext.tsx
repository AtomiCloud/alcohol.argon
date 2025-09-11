import React, { createContext, ReactNode, useContext, useState } from 'react';

interface EmptyContextType {
  desc?: string;
  setDesc: (desc: string) => void;
  clearDesc: () => void;
}

const EmptyContext = createContext<EmptyContextType | undefined>(undefined);

interface EmptyProviderProps {
  children: ReactNode;
}

function EmptyProvider({ children }: EmptyProviderProps) {
  // Use a counter internally instead of boolean
  const [desc, setDesc] = useState<string | undefined>(undefined);

  const clearDesc = () => setDesc(undefined);

  return <EmptyContext.Provider value={{ desc, setDesc, clearDesc }}>{children}</EmptyContext.Provider>;
}

function useEmptyContext() {
  const context = useContext(EmptyContext);
  if (context === undefined) {
    throw new Error('useEmptyContext must be used within an EmptyProvider');
  }
  return context;
}

export { useEmptyContext, EmptyProvider, EmptyContext, type EmptyProviderProps };
