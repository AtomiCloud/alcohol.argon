import type { Problem } from '@/lib/problem/core/types';
import { isProblem } from '@/lib/problem/core/types';
import type { ResultSerial } from '@/lib/monads/result';

/**
 * Detects if pageProps contains a serialized error from SSR
 * Checks for direct error props and ResultSerial error tuples
 */
export function detectSerialError(pageProps: Record<string, unknown>): Problem | null {
  // Direct error prop (e.g., props: { error: problem })
  if (pageProps.error && isProblem(pageProps.error)) {
    return pageProps.error;
  }

  // Check common prop names that might contain ResultSerial error tuples
  const possibleErrorProps = ['result', 'data', 'response'];
  for (const propName of possibleErrorProps) {
    const prop = pageProps[propName];
    // Check if it's a ResultSerial error tuple: ['err', Problem]
    if (Array.isArray(prop) && prop.length === 2 && prop[0] === 'err') {
      const [, errorData] = prop as ResultSerial<unknown, Problem>;
      if (isProblem(errorData)) return errorData;
    }
  }

  return null;
}
