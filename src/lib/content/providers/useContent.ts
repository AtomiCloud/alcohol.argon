import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import type { AtomiContent } from '@/lib/content/core/types';
import { useLoadingContext } from '@/lib/content/providers/LoadingContext';
import { useEmptyContext } from '@/lib/content/providers/EmptyContext';
import { useEffect, useState } from 'react';
import { Res } from '@/lib/monads/result';

function useContent<T, Y>(
  input: AtomiContent<T, Y>,
  contentName: string,
  defaultContent?: T,
  emptyChecker?: (t: T) => boolean,
): T | undefined {
  const i = Res.async<T, Y>(() => Promise.resolve(input));
  const { throwUnknown } = useErrorHandler();
  const { startLoading, stopLoading } = useLoadingContext();
  const { setDesc, clearDesc } = useEmptyContext();

  const [content, setContent] = useState<T | undefined>(defaultContent);
  useEffect(() => {
    startLoading();
    i.match({
      err: err => {
        stopLoading();
        throwUnknown(err);
      },
      ok: content => {
        stopLoading();
        setContent(content);
        if (emptyChecker?.(content)) {
          setDesc(`No ${contentName} found`);
        } else if (Array.isArray(content) && content.length === 0) {
          setDesc(`No ${contentName} found`);
        } else {
          clearDesc();
        }
      },
    }).then(() => console.debug(`Content ${contentName} loaded`));
  }, [i, setDesc, contentName, startLoading, stopLoading, throwUnknown, clearDesc, emptyChecker]);
  return content;
}

export { useContent };
