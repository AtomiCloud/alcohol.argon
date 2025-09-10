import type { Content } from '@/lib/content/core/types';
import { useEffect, useState } from 'react';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import { useLoadingContext } from '@/lib/content/providers/LoadingContext';

function useContent<T, Y>(input: Content<T, Y>): T | undefined {
  const { throwUnknown } = useErrorHandler();
  // const { startLoading, stopLoading } = useLoadingContext();
  const [content, setContent] = useState<T | undefined>(undefined);
  useEffect(() => {
    const [type, value] = input;
    if (type === 'err') {
      throwUnknown(value);
    } else {
      const [exist, content] = value;
      if (exist) {
        setContent(content);
      } else {
      }
    }
  }, [input, throwUnknown]);
  return content;
}

export { useContent };
