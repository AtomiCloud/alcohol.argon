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

// Core types and interfaces
export type {
  HttpErrorDetails,
  InferProblemContext,
  Problem,
  ProblemConfig,
  ProblemResult,
  SwaggerApiResponse,
  ZodProblemDefinition,
} from './core/types';

export { isProblem } from './core/types';

// Core classes
export { HttpResponseMapper } from './core/http-mapper';
export { NoOpErrorReporter } from './core/no-op-error-reporter';
export { ProblemRegistry } from './core/registry';
export { ProblemTransformer, type ErrorReporter } from './core/transformer';

// Utilities
// Note: Zod v4 has native JSON Schema support via schema.toJSONSchema()
export {
  ContentTypeParserRegistry,
  defaultContentTypeRegistry,
  FormDataParser,
  JsonParser,
  TextParser,
  TomlParser,
  XmlParser,
  YamlParser,
  type ContentTypeParser,
} from './utils/content-type-parser';
