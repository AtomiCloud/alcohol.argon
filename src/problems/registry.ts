/**
 * User space problem registry
 * Import and register all your application-specific problems here
 */

import { ProblemRegistry } from '@/lib/problem/core/registry';
import { entityConflictDefinition } from './definitions/entity-conflict';
import { unauthorizedDefinition } from './definitions/unauthorized';
import { validationErrorDefinition } from './definitions/validation-error';

/**
 * Create and configure the problem registry
 */
export function createProblemRegistry() {
  // Configuration - this would typically be injected via DI
  const config = {
    baseUri: 'https://api.zinc.sulfone.pichu.cluster.atomi.cloud',
    version: '1.0',
    service: 'argon',
  };

  const registry = new ProblemRegistry(config);

  // Register all application-specific problems
  registry.register(entityConflictDefinition);
  registry.register(unauthorizedDefinition);
  registry.register(validationErrorDefinition);

  // Add more problem registrations here as needed
  // registry.register(yourNewProblemDefinition);

  return registry;
}

/**
 * Singleton instance for use across the application
 */
export const problemRegistry = createProblemRegistry();
