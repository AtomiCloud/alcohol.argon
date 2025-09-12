import { useEffect, useRef } from 'react';
import type { ContentLoaderFn } from './useContent';

function useLoadingWithDelay(loader: ContentLoaderFn, delay = 0) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const cancelledRef = useRef(false);

  // Call this to start loading (with optional delay)
  function start() {
    cancelledRef.current = false;
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (!cancelledRef.current) {
          loader.startLoading();
        }
        timeoutRef.current = null;
      }, delay);
    } else {
      loader.startLoading();
    }
  }

  // Call this to stop loading
  function stop() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      cancelledRef.current = true;
    }
    loader.stopLoading();
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { start, stop };
}

export { useLoadingWithDelay };
