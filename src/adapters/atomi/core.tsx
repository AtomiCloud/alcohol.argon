import React, { ReactNode } from 'react';

// ============================================
// Simple Bridge Helper
// ============================================

type BridgeProps = {
  children: ReactNode;
  [key: string]: any;
};

/**
 * Creates a wrapper component that calls hooks and passes values as props
 */
function createBridge<P extends Record<string, any>>(
  Provider: React.ComponentType<P>,
  useHooks: () => Omit<P, 'children'> | null,
) {
  return function BridgedProvider({ children, ...staticProps }: BridgeProps) {
    const dynamicProps = useHooks();

    if (!dynamicProps) {
      return <>{children}</>;
    }

    return (
      <Provider {...(staticProps as P)} {...dynamicProps}>
        {children}
      </Provider>
    );
  };
}

export { createBridge };
export type { BridgeProps };
