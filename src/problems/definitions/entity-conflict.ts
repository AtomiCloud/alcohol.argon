import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

/**
 * Zod schema for EntityConflict problem additional properties
 */
export const EntityConflictSchema = z.object({
  TypeName: z.string().describe('The Full Name of the type of entity that is in conflict'),
  AssemblyQualifiedName: z.string().describe('The AssemblyQualifiedName of the entity that is in conflict'),
});

/**
 * TypeScript type inferred from schema
 */
export type EntityConflictContext = z.infer<typeof EntityConflictSchema>;

/**
 * EntityConflict problem definition
 */
export const entityConflictDefinition: ZodProblemDefinition<typeof EntityConflictSchema> = {
  id: 'entity_conflict',
  title: 'EntityConflict',
  version: 'v1',
  description: 'This error means an unique field conflict, or/and already exists.',
  status: 409,
  schema: EntityConflictSchema,
  createDetail: context => `Entity conflict: ${context.TypeName} (${context.AssemblyQualifiedName}) already exists`,
};
