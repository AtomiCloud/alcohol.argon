import deepmerge from 'deepmerge';

interface MergeOptions {
  arrayMerge?: (target: unknown[], source: unknown[]) => unknown[];
}

class ConfigurationMerger {
  constructor(private readonly envPrefix: string) {}

  /**
   * Enhanced merge method supporting 4-tier configuration hierarchy:
   * base => landscape => build-time env => runtime env
   */
  merge<T>(
    base: T,
    buildTimeEnv: Partial<T> = {},
    runtimeEnv: Partial<T> = {},
    arrayMerge?: (target: unknown[], source: unknown[]) => unknown[],
  ): T {
    const mergeOpts = {
      arrayMerge: arrayMerge || ((target: unknown[], source: unknown[]) => source),
    };

    // 4-tier merge: base => landscape => build-time => runtime
    const withBuildTime = deepmerge(base, buildTimeEnv, mergeOpts);
    return deepmerge(withBuildTime, runtimeEnv, mergeOpts);
  }

  /**
   * Legacy 3-tier merge method for backward compatibility
   */
  mergeLegacy<T>(
    base: T,
    landscape: Partial<T> = {},
    envOverrides: Partial<T> = {},
    mergeOptions: MergeOptions = {},
  ): T {
    const mergeOpts = {
      arrayMerge: mergeOptions.arrayMerge || ((target: unknown[], source: unknown[]) => source),
    };

    // First merge base with landscape-specific overrides
    const withLandscape = deepmerge(base, landscape, mergeOpts);

    // Then merge with environment variable overrides
    return deepmerge(withLandscape, envOverrides, mergeOpts);
  }

  processEnvVariables(variables: object): Record<string, unknown> {
    const envVars: Record<string, unknown> = {};

    // Process build-time variables
    for (const [key, value] of Object.entries(variables)) {
      if (key.startsWith(this.envPrefix)) {
        // Remove prefix and convert to nested object path
        const configPath = key.substring(this.envPrefix.length);
        const pathParts = configPath.split('__');

        // Convert value to appropriate type
        const parsedValue = this.parseEnvironmentValue(value as string);

        // Set nested value
        this.setNestedValue(envVars, pathParts, parsedValue);
      }
    }

    return envVars;
  }

  /**
   * Process build-time environment variables from injected build environment
   */
  processBuildTimeEnvironmentVariables(): Record<string, unknown> {
    const variables = process.env.BUILD_TIME_VARIABLES || {};
    return this.processEnvVariables(variables);
  }

  processEnvironmentVariables(): Record<string, unknown> {
    return this.processEnvVariables(process.env);
  }

  private parseEnvironmentValue(value: string): unknown {
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

  private setNestedValue(obj: Record<string, unknown>, pathParts: string[], value: unknown): void {
    let current: Record<string, unknown> | unknown[] = obj;

    // Navigate to the parent of the final key
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = this.navigateToNextLevel(current, pathParts[i], pathParts[i + 1]);
    }

    // Set the final value
    const lastPart = pathParts[pathParts.length - 1];
    this.setValueAtKey(current, lastPart, value);
  }

  private navigateToNextLevel(
    current: Record<string, unknown> | unknown[],
    part: string,
    nextPart: string,
  ): Record<string, unknown> | unknown[] {
    const isNextPartArrayIndex = /^\d+$/.test(nextPart);

    if (Array.isArray(current)) {
      return this.navigateArrayLevel(current, part, isNextPartArrayIndex);
    }

    return this.navigateObjectLevel(current, part, isNextPartArrayIndex);
  }

  private navigateArrayLevel(
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

  private navigateObjectLevel(
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

  private setValueAtKey(current: Record<string, unknown> | unknown[], key: string, value: unknown): void {
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
}

export { ConfigurationMerger };
export type { MergeOptions };
