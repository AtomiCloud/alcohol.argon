import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

/**
 * Zod schema for Local Error problem additional properties
 */
const LocalErrorSchema = z.object({
  errorName: z.string().describe('Name of the error class (e.g., RangeError, TypeError)'),
  errorMessage: z.string().describe('Original error message'),
  stackTrace: z.string().optional().describe('Stack trace of the error'),
  context: z.string().optional().describe('Additional context about where the error occurred'),
});

/**
 * TypeScript type inferred from schema
 */
type LocalErrorContext = z.infer<typeof LocalErrorSchema>;

/**
 * Local Error problem definition
 */
const localErrorDefinition: ZodProblemDefinition<typeof LocalErrorSchema> = {
  id: 'local_error',
  title: 'Local Error',
  version: 'v1',
  description: 'A local JavaScript/TypeScript error occurred during execution.',
  status: 500,
  schema: LocalErrorSchema,
  createDetail: context => {
    const contextStr = context.context ? ` in ${context.context}` : '';
    return `${context.errorName}${contextStr}: ${context.errorMessage}`;
  },
};

export { type LocalErrorContext, localErrorDefinition, LocalErrorSchema };
