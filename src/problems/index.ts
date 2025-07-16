/**
 * User space problems export
 * Export all problem definitions and utilities
 */

// Problem definitions
export { entityConflictDefinition, type EntityConflictContext } from './definitions/entity-conflict';
export { unauthorizedDefinition, type UnauthorizedContext } from './definitions/unauthorized';
export { validationErrorDefinition, type ValidationErrorContext } from './definitions/validation-error';

// Registry
export { createProblemRegistry, type ProblemId } from './registry';

// Re-export library types for convenience
export type { ZodProblemDefinition, Problem, ProblemResult, InferProblemContext } from '@/lib/problem/core/types';
