import type { ParsedUrlQuery } from 'node:querystring';
import { type RefObject, useEffect, useRef } from 'react';

function mergeQueryWithDefaults<T extends Record<string, string>>(defaults: T, query: ParsedUrlQuery): T {
  const acc: Record<string, string> = {};
  for (const key in defaults) acc[key] = (query[key] as string) ?? defaults[key];
  return acc as T;
}

function queryEqual<T extends Record<string, string>>(a: T, b: T): boolean {
  return Object.keys(a).every(key => a[key] === b[key]);
}

function useRefWrap<T>(t: T): RefObject<T> {
  const ref = useRef(t);
  useEffect(() => {
    ref.current = t;
  }, [t]);
  return ref;
}

export { mergeQueryWithDefaults, queryEqual, useRefWrap };
