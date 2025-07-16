import { z } from 'zod';
import type { ConfigSchemas } from './registry';

export interface ValidationError {
  configType: string;
  errors: string[];
}

export class ConfigValidationError extends Error {
  public readonly validationErrors: ValidationError;

  constructor(validationErrors: ValidationError) {
    super(
      `Configuration validation failed for '${validationErrors.configType}': ${validationErrors.errors.join(', ')}`,
    );
    this.name = 'ConfigValidationError';
    this.validationErrors = validationErrors;
  }
}

export function validateConfiguration<T>(configType: string, config: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError = {
        configType,
        errors: error.issues.map(issue => {
          const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
          return `${path}${issue.message}`;
        }),
      };

      throw new ConfigValidationError(validationErrors);
    }

    throw error;
  }
}

export function validateAllConfigurations(
  configs: Record<string, unknown>,
  schemas: ConfigSchemas,
): { common: unknown; client: unknown; server?: unknown } {
  const validatedConfigs: Record<string, unknown> = {};

  for (const [configType, schema] of Object.entries(schemas)) {
    if (configType in configs) {
      validatedConfigs[configType] = validateConfiguration(configType, configs[configType], schema);
    } else if (configType !== 'server') {
      // Server config is optional, but common and client are required
      throw new Error(`Missing configuration for '${configType}'`);
    }
  }

  return validatedConfigs as { common: unknown; client: unknown; server?: unknown };
}

export function getValidationErrorMessage(error: ConfigValidationError): string {
  const { configType, errors } = error.validationErrors;

  return `Configuration validation failed for '${configType}':\n${errors.map(err => `  - ${err}`).join('\n')}`;
}

export function isConfigValidationError(error: unknown): error is ConfigValidationError {
  return error instanceof ConfigValidationError;
}
