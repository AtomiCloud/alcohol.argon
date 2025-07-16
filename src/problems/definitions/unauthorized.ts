import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

/**
 * Zod schema for Unauthorized problem additional properties
 */
export const UnauthorizedSchema = z.object({
  requiredPermission: z.string().describe('The permission required to access this resource'),
  userId: z.string().optional().describe('The ID of the user who attempted access'),
});

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
  description: 'Access denied due to insufficient permissions or invalid credentials.',
  status: 401,
  schema: UnauthorizedSchema,
  createDetail: context => `Access denied. Required permission: ${context.requiredPermission}`,
};
