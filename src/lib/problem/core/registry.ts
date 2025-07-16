import type { NextApiRequest, NextApiResponse } from 'next';
import type { z } from 'zod';
import type { Problem, ProblemConfig, ZodProblemDefinition, InferProblemContext } from './types';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Registry for managing Zod-based problem definitions
 * Provides Next.js API route integration
 */
export class ProblemRegistry {
  private problems = new Map<string, ZodProblemDefinition>();

  constructor(private config: ProblemConfig) {}

  /**
   * Register a Zod-based problem definition
   */
  register<TSchema extends z.ZodType>(definition: ZodProblemDefinition<TSchema>): void {
    this.problems.set(definition.id, definition as unknown as ZodProblemDefinition);
  }

  /**
   * Get a problem definition by ID
   */
  get(id: string): ZodProblemDefinition | undefined {
    return this.problems.get(id);
  }

  /**
   * Get all registered problem IDs
   */
  getAllIds(): string[] {
    return Array.from(this.problems.keys());
  }

  /**
   * Get all registered problem definitions
   */
  getAll(): ZodProblemDefinition[] {
    return Array.from(this.problems.values());
  }

  /**
   * Create a problem instance by ID with context validation
   */
  createProblem(
    id: string,
    context: Record<string, unknown>,
    additionalDetail?: string,
    instance?: string,
  ): Problem | null {
    const definition = this.problems.get(id);
    if (!definition) {
      return null;
    }

    // Validate context against Zod schema
    const parseResult = definition.schema.safeParse(context);
    if (!parseResult.success) {
      throw new Error(`Invalid context for problem ${id}: ${parseResult.error.message}`);
    }

    const validatedContext = parseResult.data;

    // Generate detail message
    let detail: string;
    if (definition.createDetail) {
      detail = definition.createDetail(validatedContext);
    } else {
      detail = `${definition.title} occurred`;
    }

    // Append additional detail if provided
    if (additionalDetail) {
      detail = `${detail}. ${additionalDetail}`;
    }

    // Create problem with spread context
    return {
      type: this.buildTypeUri(definition.id),
      title: definition.title,
      status: definition.status,
      detail,
      instance,
      ...validatedContext, // Spread validated context into problem
    };
  }

  /**
   * Build type URI for a problem ID
   */
  buildTypeUri(problemId: string): string {
    return `${this.config.baseUri}/${this.config.service}/api/v${this.config.version}/${problemId}`;
  }

  /**
   * Next.js API route handler for listing all problems
   * GET /api/v1.0/error-info
   * Returns: ["entity_conflict", "unauthorized", "validation_error"]
   */
  handleListProblems = (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const problemIds = this.getAllIds();
      res.status(200).json(problemIds);
    } catch (error) {
      res.status(500).json({
        type: this.buildTypeUri('internal_error'),
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to retrieve problem list',
      });
    }
  };

  /**
   * Next.js API route handler for getting a specific problem schema
   * GET /api/v1.0/error-info/[id]
   * Returns the expected format with schema, id, title, version
   */
  handleGetProblemSchema = (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { id } = req.query;

      if (typeof id !== 'string') {
        return res.status(400).json({
          type: this.buildTypeUri('invalid_request'),
          title: 'Invalid Request',
          status: 400,
          detail: 'Problem ID must be a string',
        });
      }

      const definition = this.get(id);
      if (!definition) {
        return res.status(404).json({
          type: this.buildTypeUri('problem_not_found'),
          title: 'Problem Not Found',
          status: 404,
          detail: `Problem with ID '${id}' not found`,
        });
      }

      // Convert Zod schema to JSON Schema
      const jsonSchema = zodToJsonSchema(definition.schema, {
        $refStrategy: 'none',
      });

      // Return in expected format
      const response = {
        schema: {
          ...jsonSchema,
          title: definition.title,
          description: definition.description,
          additionalProperties: false,
        },
        id: definition.id,
        title: definition.title,
        version: definition.version,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        type: this.buildTypeUri('internal_error'),
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to retrieve problem schema',
      });
    }
  };

  /**
   * Convenience method to create API route handlers
   */
  createApiHandlers() {
    return {
      list: this.handleListProblems,
      schema: this.handleGetProblemSchema,
    };
  }
}
