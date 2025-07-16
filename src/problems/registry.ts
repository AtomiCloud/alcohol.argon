/**
 * User space problem registry
 * Import and register all your application-specific problems here
 */

import { ProblemRegistry } from '@/lib/problem/core/registry';
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
 * Type-safe problem ID union
 */
type ProblemId = keyof typeof PROBLEM_DEFINITIONS;

/**
 * Create and configure the type-safe problem registry
 */
function createProblemRegistry() {
  // Configuration - this would typically be injected via DI
  const config = {
    baseUri: 'https://api.zinc.sulfone.pichu.cluster.atomi.cloud',
    version: '1.0',
    service: 'argon',
  };

  return new ProblemRegistry(config, PROBLEM_DEFINITIONS);
}

/**
 * Singleton instance for use across the application
 */
const problemRegistry = createProblemRegistry();

/**
 * Type-safe problem registry type
 */
type AppProblemRegistry = typeof problemRegistry;

export type { AppProblemRegistry, ProblemId };
export { problemRegistry, createProblemRegistry };
