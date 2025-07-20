/**
 * User space problem registry
 * Import and register all your application-specific problems here
 */

import type { CommonConfig } from '@/config';
import { ProblemRegistry } from '@/lib/problem/core/registry';
import { entityConflictDefinition } from './definitions/entity-conflict';
import { httpErrorDefinition } from './definitions/http-error';
import { localErrorDefinition } from './definitions/local-error';
import { unauthorizedDefinition } from './definitions/unauthorized';
import { validationErrorDefinition } from './definitions/validation-error';

/**
 * Static problem definitions mapping - all problems known at compile time
 */
const PROBLEM_DEFINITIONS = {
  entity_conflict: entityConflictDefinition,
  http_error: httpErrorDefinition,
  local_error: localErrorDefinition,
  unauthorized: unauthorizedDefinition,
  validation_error: validationErrorDefinition,
} as const;

/**
 * Type-safe problem ID union
 */
type ProblemId = keyof typeof PROBLEM_DEFINITIONS;

/**
 * Type-safe problem registry type
 */
export { PROBLEM_DEFINITIONS };
export type { ProblemId };
