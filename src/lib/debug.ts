import { useEffect } from 'react';

function useDebug(name: string) {
  useEffect(() => {
    console.debug(`%cModuleProvider ${name} mounted`, 'color: blue;');

    return () => {
      console.debug(`%cModuleProvider ${name} unmounted`, 'color: green;');
    };
  }, [name]);
}

export { useDebug };
