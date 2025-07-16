/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://tools.ietf.org/html/rfc7807
 *
 * Core types only - no predefined problems
 */

import type { Result } from '@/lib/monads/result';
import type { z } from 'zod';

/**
 * RFC 7807 Problem Details interface
 */
export interface Problem {
  /** URI reference identifying the problem type */
  type: string;
  /** Human-readable summary of the problem type */
  title: string;
  /** HTTP status code */
  status: number;
  /** Human-readable explanation specific to this occurrence */
  detail: string;
  /** URI reference identifying the specific occurrence */
  instance?: string;
  /** Additional extensible properties */
  [key: string]: unknown;
}

/**
 * Configuration for problem generation
 */
export interface ProblemConfig {
  /** Base URI for problem types (e.g., "https://api.example.com") */
  baseUri: string;
  /** API version */
  version: string;
  /** Service identifier */
  service: string;
}

/**
 * Zod-based problem definition for user space
 */
export interface ZodProblemDefinition<TSchema extends z.ZodType = z.ZodType> {
  /** Unique identifier for this problem type */
  id: string;
  /** Human-readable title */
  title: string;
  /** API version */
  version: string;
  /** Problem description */
  description: string;
  /** Default HTTP status code */
  status: number;
  /** Zod schema for additional properties */
  schema: TSchema;
  /** Function to create detail message from context */
  createDetail?: (context: z.infer<TSchema>) => string;
}

/**
 * Response structure from swagger-typescript-api
 */
export interface SwaggerApiResponse<T = unknown> {
  data: T | null;
  error: unknown | null;
}

/**
 * HTTP error details for generic problem creation
 */
export interface HttpErrorDetails {
  status: number;
  statusText: string;
  body?: string;
  headers?: Record<string, string>;
  url?: string;
}

/**
 * Check if an object has minimum RFC 7807 properties
 */
export function isProblem(obj: unknown): obj is Problem {
  if (!obj || typeof obj !== 'object') return false;

  const problem = obj as Record<string, unknown>;

  return (
    typeof problem.type === 'string' &&
    typeof problem.title === 'string' &&
    typeof problem.status === 'number' &&
    typeof problem.detail === 'string'
  );
}

/**
 * Type alias for Result with Problem as error type
 */
export type ProblemResult<T> = Result<T, Problem>;

/**
 * Extract TypeScript type from Zod schema
 */
export type InferProblemContext<T extends ZodProblemDefinition> = z.infer<T['schema']>;
