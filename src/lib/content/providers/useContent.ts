import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import type { AtomiContent } from '@/lib/content/core/types';
import { useLoadingContext } from '@/lib/content/providers/LoadingContext';
import { useEmptyContext } from '@/lib/content/providers/EmptyContext';
import { useEffect, useRef, useState } from 'react';
import { Res, type ResultSerial } from '@/lib/monads/result';

type ContentLoaderFn = {
  startLoading: () => void;
  stopLoading: () => void;
};

type ContentEmptyFn = {
  setEmpty: (desc: string) => void;
  clear: () => void;
};

/**
 * Setting on how the content engine hook should work
 */
type ContentSetting<T, Y> = {
  /**
   * Default content to show (usually from SSR) to prevent initial loading screen
   */
  defaultContent?: ResultSerial<T, Y>;
  /**
   * The definition of whether the content is empty. To disable an empty page,
   * return a lambda that always resolves to false.
   *
   * If omitted, it will check if the content is an empty array, where
   * an empty array will result in a empty page.
   * @param t the content
   */
  emptyChecker?: (t: T) => boolean;
  /**
   * This will be called when loading starts and stops. If omitted,
   * it will call the Layout-level start and stop loading, which WILL disrupt
   * the content.
   */
  loader?: ContentLoaderFn;
  /**
   * If the loader has a delay, it will only call the start loading after the delay.
   *
   * This is can be used to prevent jitters.
   */
  loaderDelay?: number;
  /**
   * This will be called when an empty content is detected, with the `notFound` field
   * in the content setting.
   *
   * If omitted, it will call the Layout-level empty page, which WILL disrupt
   * the content.
   */
  empty?: ContentEmptyFn;
  /**
   * This will be called when the content results in an error.
   *
   * If omitted, it will call the layout level error page, which will disrupt
   * the content
   * @param u unknown error
   */
  error?: (u: unknown) => void;
  /**
   * What the empty page show as text
   */
  notFound?: string;
};

function loadWithDelay(loader: ContentLoaderFn, delay = 0) {
  let timeoutRef: NodeJS.Timeout | null = null;

  // Call this to start loading (with optional delay)
  function start() {
    if (delay > 0) {
      timeoutRef = setTimeout(() => {
        loader.startLoading();
        timeoutRef = null;
      }, delay);
    } else {
      loader.startLoading();
    }
  }

  // Call this to stop loading
  function stop() {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    } else {
      loader.stopLoading();
    }
  }

  return { start, stop };
}

function useContent<T, Y>(input: AtomiContent<T, Y>, setting?: ContentSetting<T, Y>): T | undefined {
  const { throwUnknown } = useErrorHandler();
  const { startLoading, stopLoading } = useLoadingContext();
  const { setDesc, clearDesc } = useEmptyContext();
  let initial: T | undefined = undefined;

  if (setting?.defaultContent) {
    const [t, v] = setting.defaultContent;
    if (t === 'ok') initial = v;
    else throwUnknown(v);
  }

  const loader = {
    startLoading: setting?.loader?.startLoading ?? startLoading,
    stopLoading: setting?.loader?.stopLoading ?? stopLoading,
  };
  const setEmpty = setting?.empty?.setEmpty ?? setDesc;

  const clearEmpty = setting?.empty?.clear ?? clearDesc;
  const onError = setting?.error ?? throwUnknown;

  const [content, setContent] = useState<T | undefined>(initial);

  const latestRequestId = useRef(0);

  useEffect(() => {
    const i = Res.async(() => Promise.resolve(input));
    const { start, stop } = loadWithDelay(loader, setting?.loaderDelay);
    start();
    const requestId = ++latestRequestId.current;
    i.match({
      err: err => {
        stop();
        onError(err);
      },
      ok: content => {
        stop();
        if (requestId === latestRequestId.current) {
          setContent(content);
          if (setting?.emptyChecker?.(content)) {
            setEmpty(setting?.notFound ?? 'No content found');
          } else if (Array.isArray(content) && content.length === 0) {
            setEmpty(setting?.notFound ?? 'No content found');
          } else {
            clearEmpty();
          }
        }
      },
    }).then(() => console.debug('Content loaded'));
  }, [input, setting?.notFound, setting?.defaultContent]);
  return content;
}

export { useContent };
export type { ContentLoaderFn, ContentEmptyFn, ContentSetting };
