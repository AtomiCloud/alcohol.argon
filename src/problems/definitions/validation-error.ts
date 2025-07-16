import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

/**
 * Zod schema for ValidationError problem additional properties
 */
const ValidationErrorSchema = z.object({
  field: z.string().describe('The name of the field that failed validation'),
  value: z.unknown().optional().describe('The invalid value that was provided'),
  constraint: z.string().describe('The validation constraint that was violated'),
  code: z.string().optional().describe('Machine-readable validation error code'),
});

/**
 * TypeScript type inferred from schema
 */
type ValidationErrorContext = z.infer<typeof ValidationErrorSchema>;

/**
 * ValidationError problem definition
 */
const validationErrorDefinition: ZodProblemDefinition<typeof ValidationErrorSchema> = {
  id: 'validation_error',
  title: 'ValidationError',
  version: 'v1',
  description: 'Input validation failed for one or more fields.',
  status: 400,
  schema: ValidationErrorSchema,
  createDetail: context => `Validation failed for field '${context.field}': ${context.constraint}`,
};

export { type ValidationErrorContext, validationErrorDefinition, ValidationErrorSchema };
