import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

type UrlStateOptions = {
  shallow?: boolean;
  replace?: boolean;
};

/**
 * Hook for synchronizing a state value with URL search parameters
 */
function useUrlState(paramName: string, initialValue = '', options: UrlStateOptions = {}) {
  const router = useRouter();
  const { shallow = true, replace = true } = options;

  const [state, setState] = useState<string>(() => (router.query[paramName] as string) || initialValue);

  const updateState = useCallback(
    (newValue: string) => {
      setState(newValue);
      const newQuery = { ...router.query };
      newQuery[paramName] = newValue;
      const routerMethod = replace ? router.replace : router.push;
      routerMethod({ pathname: router.pathname, query: newQuery }, undefined, { shallow }).then();
    },
    [paramName, router, shallow, replace],
  );

  // Sync state with URL changes
  useEffect(() => {
    const urlValue = (router.query[paramName] as string) || '';
    if (urlValue !== state) setState(urlValue);
  }, [router.query[paramName], state, paramName]);

  return [state, updateState] as const;
}

export { useUrlState, type UrlStateOptions };
