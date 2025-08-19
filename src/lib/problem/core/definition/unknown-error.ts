import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

/**
 * Zod schema for Local Error problem additional properties
 */
const UnknownErrorSchema = z.object({
  type: z.string().describe('the type of the unknown error'),
  value: z.string().describe('The serialized version of the unknown error'),
  stackTrace: z.string().optional().describe('Stack trace of where this happened'),
});

/**
 * TypeScript type inferred from schema
 */
type UnknownErrorContext = z.infer<typeof UnknownErrorSchema>;

/**
 * Local Error problem definition
 */
const unknownErrorDefinition: ZodProblemDefinition<typeof UnknownErrorSchema> = {
  id: 'local_error',
  title: 'Local Error',
  version: 'v1',
  description: 'A local JavaScript/TypeScript error occurred during execution.',
  status: 500,
  schema: UnknownErrorSchema,
  createDetail: context => {
    return `Unknown object of type ${context.type} thrown`;
  },
};

export { type UnknownErrorContext, UnknownErrorSchema, unknownErrorDefinition };
