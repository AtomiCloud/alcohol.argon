import { useConfigContext } from './ConfigProvider';

export function useCommonConfig<T = unknown>(): T {
  if (typeof window === 'undefined') {
    throw new Error(
      'useCommonConfig cannot be used during server-side rendering. Use withServerSideConfig or withStaticConfig instead.',
    );
  }

  const { registry } = useConfigContext();
  return registry.common as T;
}

export function useClientConfig<T = unknown>(): T {
  if (typeof window === 'undefined') {
    throw new Error(
      'useClientConfig cannot be used during server-side rendering. Use withServerSideConfig or withStaticConfig instead.',
    );
  }

  const { registry } = useConfigContext();
  return registry.client as T;
}

export function useServerConfig<T = unknown>(): T {
  if (typeof window !== 'undefined') {
    throw new Error(
      'useServerConfig cannot be used in the browser. Server configuration is not available on the client side for security reasons.',
    );
  }

  const { registry } = useConfigContext();
  return registry.server as T;
}

export function useConfig() {
  return {
    common: useCommonConfig(),
    client: useClientConfig(),
  };
}

export function useConfigRegistry() {
  const { registry } = useConfigContext();
  return registry;
}
