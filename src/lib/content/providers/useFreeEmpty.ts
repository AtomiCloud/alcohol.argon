import type { ContentEmptyFn, ContentLoaderFn } from '@/lib/content/providers/useContent';
import { useState } from 'react';

function useFreeEmpty(): [string | undefined, ContentEmptyFn] {
  const [desc, setDesc] = useState<string | undefined>(undefined);
  return [
    desc,
    {
      setEmpty: setDesc,
      clear: () => setDesc(undefined),
    },
  ];
}

export { useFreeEmpty };
