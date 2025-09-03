import { AuthState } from '@/lib/auth/core/types';
import React, { createContext, useContext } from 'react';

interface InitialAuthStateContextValue {
  initialAuthState?: AuthState;
}

const InitialAuthStateContext = createContext<InitialAuthStateContextValue>({});

function InitialAuthTokenProvider({
  children,
  initialAuthState,
}: {
  children: React.ReactNode;
  initialAuthState: AuthState;
}) {
  return <InitialAuthStateContext.Provider value={{ initialAuthState }}>{children}</InitialAuthStateContext.Provider>;
}

function useInitialAuthState(): AuthState | undefined {
  const { initialAuthState } = useContext(InitialAuthStateContext);
  return initialAuthState;
}

export { InitialAuthTokenProvider, useInitialAuthState };
