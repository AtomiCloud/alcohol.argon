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
  let current = obj;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i].toLowerCase();

    if (!(part in current)) {
      current[part] = {};
    }

    current = current[part] as Record<string, unknown>;
  }

  const lastPart = pathParts[pathParts.length - 1].toLowerCase();
  current[lastPart] = value;
}
