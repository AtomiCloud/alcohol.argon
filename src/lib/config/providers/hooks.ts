import { getValidatedConfig } from '../core/registry';

export function useCommonConfig<T = unknown>(): T {
  return getValidatedConfig('common') as T;
}

export function useClientConfig<T = unknown>(): T {
  if (typeof window === 'undefined') {
    throw new Error(
      'useClientConfig cannot be used during server-side rendering. Use withServerSideConfig or withStaticConfig instead.',
    );
  }

  return getValidatedConfig('client') as T;
}

export function useServerConfig<T = unknown>(): T {
  if (typeof window !== 'undefined') {
    throw new Error(
      'useServerConfig cannot be used in the browser. Server configuration is not available on the client side for security reasons.',
    );
  }

  return getValidatedConfig('server') as T;
}

export function useConfig() {
  return {
    common: useCommonConfig(),
    client: useClientConfig(),
  };
}
