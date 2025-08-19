/**
 * RFC 7807 Problem Details Library
 *
 * This library provides infrastructure for handling RFC 7807 Problem Details
 * in HTTP APIs. Problem definitions are managed in user space.
 *
 * Features:
 * - RFC 7807 compliant Problem types
 * - Zod-based problem definitions with auto-generated JSON Schema
 * - Transformation from various error types to Problems
 * - HTTP response mapping for swagger-typescript-api
 * - Problem registry with Next.js API route integration
 * - Context validation and spreading
 * - DI-compatible design
 */

import type { ZodProblemDefinition } from './types';

// Core types and interfaces
export type { InferProblemContext, Problem, ProblemConfig, ProblemResult, ZodProblemDefinition } from './types';

export { isProblem } from './types';

// Core classes
export { NoOpErrorReporter } from './no-op-error-reporter';
export { ProblemRegistry } from './registry';
export { ProblemTransformer, type ErrorReporter } from './transformer';

// biome-ignore lint/suspicious/noExplicitAny: Generic needs any type to function correctly
export type ProblemDefinitions = Record<string, ZodProblemDefinition<any>>;
