/**
 * User space problem registry
 * Import and register all your application-specific problems here
 */

import { entityConflictDefinition } from './definitions/entity-conflict';
import { unauthorizedDefinition } from './definitions/unauthorized';
import { validationErrorDefinition } from './definitions/validation-error';

/**
 * Static problem definitions mapping - all problems known at compile time
 */
const PROBLEM_DEFINITIONS = {
  entity_conflict: entityConflictDefinition,
  unauthorized: unauthorizedDefinition,
  validation_error: validationErrorDefinition,
} as const;

/**
 * Type-safe problem registry type
 */
export { PROBLEM_DEFINITIONS };
