import { z } from 'zod';
import type { ConfigSchemas } from './registry';

interface ValidationError {
  configType: string;
  errors: string[];
}

class ConfigValidationError extends Error {
  public readonly validationErrors: ValidationError;

  constructor(validationErrors: ValidationError) {
    super(
      `Configuration validation failed for '${validationErrors.configType}': ${validationErrors.errors.join(', ')}`,
    );
    this.name = 'ConfigValidationError';
    this.validationErrors = validationErrors;
  }
}

class ConfigurationValidator {
  constructor(private readonly throwOnFirstError: boolean) {}

  formatError(error: ConfigValidationError): string {
    const { configType, errors } = error.validationErrors;
    return `Configuration validation failed for '${configType}': ${errors.join(', ')}`;
  }

  validate<T>(configType: string, config: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError = {
          configType,
          errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
        };

        throw new ConfigValidationError(validationErrors);
      }

      throw error;
    }
  }

  validateAll(
    configs: Record<string, unknown>,
    schemas: ConfigSchemas,
  ): { common: unknown; client: unknown; server: unknown } {
    const validatedConfigs: Record<string, unknown> = {};
    const allErrors: ValidationError[] = [];

    for (const [configType, schema] of Object.entries(schemas)) {
      try {
        if (configType in configs) {
          validatedConfigs[configType] = this.validate(configType, configs[configType], schema);
        } else {
          throw new Error(`Missing configuration for '${configType}'`);
        }
      } catch (error) {
        if (error instanceof ConfigValidationError) {
          allErrors.push(error.validationErrors);
        } else {
          allErrors.push({
            configType,
            errors: [error instanceof Error ? error.message : String(error)],
          });
        }

        if (this.throwOnFirstError) {
          throw error;
        }
      }
    }

    if (allErrors.length > 0) {
      const combinedErrors: ValidationError = {
        configType: 'multiple',
        errors: allErrors.flatMap(err => err.errors.map(e => `${err.configType}: ${e}`)),
      };
      throw new ConfigValidationError(combinedErrors);
    }

    return validatedConfigs as { common: unknown; client: unknown; server: unknown };
  }
}

function isConfigValidationError(error: unknown): error is ConfigValidationError {
  return error instanceof ConfigValidationError;
}

export type { ValidationError };
export { ConfigValidationError, ConfigurationValidator, isConfigValidationError };
