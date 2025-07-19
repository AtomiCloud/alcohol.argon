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
  Problem,
  ProblemConfig,
  ZodProblemDefinition,
  SwaggerApiResponse,
  HttpErrorDetails,
  ProblemResult,
  InferProblemContext,
} from './core/types';

export { isProblem } from './core/types';

// Core classes
export { ProblemTransformer, type ErrorReporter } from './core/transformer';
export { NoOpErrorReporter } from './core/no-op-error-reporter';
export { HttpResponseMapper } from './core/http-mapper';
export { ProblemRegistry } from './core/registry';

// Utilities
// Note: Zod v4 has native JSON Schema support via schema.toJSONSchema()
export {
  type ContentTypeParser,
  JsonParser,
  YamlParser,
  XmlParser,
  TomlParser,
  TextParser,
  FormDataParser,
  ContentTypeParserRegistry,
  defaultContentTypeRegistry,
} from './utils/content-type-parser';

// Utility service class for easy setup
import type { ProblemConfig, ZodProblemDefinition } from './core/types';
import { ProblemTransformer, type ErrorReporter } from './core/transformer';
import { NoOpErrorReporter } from './core/no-op-error-reporter';
import { HttpResponseMapper } from './core/http-mapper';
import { ProblemRegistry } from './core/registry';

// biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for flexibility
export class ProblemService<TProblems extends Record<string, ZodProblemDefinition<any>>> {
  public readonly transformer: ProblemTransformer;
  public readonly httpMapper: HttpResponseMapper;
  public readonly registry: ProblemRegistry<TProblems>;

  constructor(config: ProblemConfig, problems: TProblems, errorReporter?: ErrorReporter) {
    this.registry = new ProblemRegistry(config, problems);
    this.transformer = new ProblemTransformer(config, this.registry, errorReporter || new NoOpErrorReporter());
    this.httpMapper = new HttpResponseMapper(this.transformer);
  }

  /**
   * Get Next.js API route handlers for problem registry
   */
  getApiHandlers() {
    return this.registry.createApiHandlers();
  }
}
