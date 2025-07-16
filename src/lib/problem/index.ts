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
export { ProblemTransformer } from './core/transformer';
export { HttpResponseMapper } from './core/http-mapper';
export { ProblemRegistry } from './core/registry';

// Utilities
export { zodToJsonSchema } from 'zod-to-json-schema';
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
import type { ProblemConfig } from './core/types';
import { ProblemTransformer } from './core/transformer';
import { HttpResponseMapper } from './core/http-mapper';
import { ProblemRegistry } from './core/registry';

export class ProblemService {
  public readonly transformer: ProblemTransformer;
  public readonly httpMapper: HttpResponseMapper;
  public readonly registry: ProblemRegistry;

  constructor(config: ProblemConfig) {
    this.transformer = new ProblemTransformer(config);
    this.httpMapper = new HttpResponseMapper(this.transformer);
    this.registry = new ProblemRegistry(config);
  }

  /**
   * Get Next.js API route handlers for problem registry
   */
  getApiHandlers() {
    return this.registry.createApiHandlers();
  }
}
