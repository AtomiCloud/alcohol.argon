import deepmerge from 'deepmerge';

export interface MergeOptions {
  arrayMerge?: (target: unknown[], source: unknown[]) => unknown[];
}

export function mergeConfigurations<T>(
  base: T,
  landscape: Partial<T> = {},
  envOverrides: Partial<T> = {},
  options: MergeOptions = {},
): T {
  const mergeOptions = {
    arrayMerge: options.arrayMerge || ((_target, source) => source),
  };

  // First merge base with landscape-specific overrides
  const withLandscape = deepmerge(base, landscape, mergeOptions);

  // Then merge with environment variable overrides
  return deepmerge(withLandscape, envOverrides, mergeOptions);
}

export function processEnvironmentVariables(): Record<string, unknown> {
  const envVars: Record<string, unknown> = {};
  const prefix = 'ATOMI_';

  // Process all environment variables with ATOMI_ prefix
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix) && value !== undefined) {
      // Remove prefix and convert to nested object path
      const configPath = key.substring(prefix.length);
      const pathParts = configPath.split('__');

      // Convert value to appropriate type
      const parsedValue = parseEnvironmentValue(value);

      // Set nested value
      setNestedValue(envVars, pathParts, parsedValue);
    }
  }

  return envVars;
}

function parseEnvironmentValue(value: string): unknown {
  // Handle boolean values
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Handle numeric values
  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  if (/^\d+\.\d+$/.test(value)) {
    return Number.parseFloat(value);
  }

  // Handle JSON values
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      // If JSON parsing fails, return as string
    }
  }

  // Return as string
  return value;
}

function setNestedValue(obj: Record<string, unknown>, pathParts: string[], value: unknown): void {
  let current: Record<string, unknown> | unknown[] = obj;

  // Navigate to the parent of the final key
  for (let i = 0; i < pathParts.length - 1; i++) {
    current = navigateToNextLevel(current, pathParts[i], pathParts[i + 1]);
  }

  // Set the final value
  const lastPart = pathParts[pathParts.length - 1];
  setValueAtKey(current, lastPart, value);
}

function navigateToNextLevel(
  current: Record<string, unknown> | unknown[],
  part: string,
  nextPart: string,
): Record<string, unknown> | unknown[] {
  const isNextPartArrayIndex = /^\d+$/.test(nextPart);

  if (Array.isArray(current)) {
    return navigateArrayLevel(current, part, isNextPartArrayIndex);
  }

  return navigateObjectLevel(current, part, isNextPartArrayIndex);
}

function navigateArrayLevel(
  current: unknown[],
  part: string,
  isNextPartArrayIndex: boolean,
): Record<string, unknown> | unknown[] {
  const index = Number.parseInt(part, 10);

  // Ensure array has enough elements
  while (current.length <= index) {
    current.push(undefined);
  }

  if (current[index] === undefined) {
    current[index] = isNextPartArrayIndex ? [] : {};
  }

  return current[index] as Record<string, unknown> | unknown[];
}

function navigateObjectLevel(
  current: Record<string, unknown>,
  part: string,
  isNextPartArrayIndex: boolean,
): Record<string, unknown> | unknown[] {
  const normalizedPart = part.toLowerCase();

  if (!(normalizedPart in current)) {
    // Create array if next part is numeric, otherwise create object
    current[normalizedPart] = isNextPartArrayIndex ? [] : {};
  }

  return current[normalizedPart] as Record<string, unknown> | unknown[];
}

function setValueAtKey(current: Record<string, unknown> | unknown[], key: string, value: unknown): void {
  if (/^\d+$/.test(key)) {
    // Array index
    if (!Array.isArray(current)) {
      throw new Error('Expected array at path but found object');
    }

    const index = Number.parseInt(key, 10);
    while (current.length <= index) {
      current.push(undefined);
    }

    current[index] = value;
  } else {
    // Object key
    if (Array.isArray(current)) {
      throw new Error('Expected object at path but found array');
    }

    const normalizedKey = key.toLowerCase();
    current[normalizedKey] = value;
  }
}
