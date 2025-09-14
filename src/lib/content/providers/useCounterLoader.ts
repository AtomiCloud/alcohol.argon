import type { ContentLoaderFn } from '@/lib/content/providers/useContent';
import { useState } from 'react';

function useCounterLoader(): [boolean, ContentLoaderFn] {
  const [count, setCount] = useState(0);
  return [
    count > 0,
    {
      startLoading: () => setCount(prev => prev + 1),
      stopLoading: () => setCount(prev => prev - 1),
    },
  ];
}

export { useCounterLoader };
