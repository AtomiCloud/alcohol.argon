import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

/**
 * Zod schema for Unauthorized problem additional properties
 */
export const UnauthorizedSchema = z.object({});

/**
 * TypeScript type inferred from schema
 */
export type UnauthorizedContext = z.infer<typeof UnauthorizedSchema>;

/**
 * Unauthorized problem definition
 */
export const unauthorizedDefinition: ZodProblemDefinition<typeof UnauthorizedSchema> = {
  id: 'unauthorized',
  title: 'Unauthorized',
  version: 'v1',
  description: 'Access denied due not being logged in.',
  status: 401,
  schema: UnauthorizedSchema,
  createDetail: context => 'Access denied, please login to continue.',
};
