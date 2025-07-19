import type { NextApiRequest, NextApiResponse } from 'next';
import type { Problem, ProblemConfig, ZodProblemDefinition, InferProblemContext } from './types';
// Using native Zod v4 JSON Schema conversion

/**
 * Type-safe problem registry with compile-time ID validation
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for flexibility
export class ProblemRegistry<TProblems extends Record<string, ZodProblemDefinition<any>>> {
  private problems: TProblems;

  constructor(
    private config: ProblemConfig,
    problems: TProblems,
  ) {
    this.problems = problems;
  }

  /**
   * Get a problem definition by ID with type safety
   */
  get<TId extends keyof TProblems>(id: TId): TProblems[TId] {
    return this.problems[id];
  }

  /**
   * Get all registered problem IDs
   */
  getAllIds(): Array<keyof TProblems> {
    return Object.keys(this.problems);
  }

  /**
   * Get all registered problem definitions
   */
  getAll(): Array<TProblems[keyof TProblems]> {
    return Object.values(this.problems) as Array<TProblems[keyof TProblems]>;
  }

  /**
   * Create a problem instance by ID with full type safety
   */
  createProblem<TId extends keyof TProblems>(
    id: TId,
    context: InferProblemContext<TProblems[TId]>,
    additionalDetail?: string,
    instance?: string,
  ): Problem & InferProblemContext<TProblems[TId]> {
    const definition = this.problems[id];

    // Validate context against Zod schema
    const parseResult = definition.schema.safeParse(context);
    if (!parseResult.success) {
      throw new Error(`Invalid context for problem ${String(id)}: ${parseResult.error.message}`);
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
      type: this.buildTypeUri(String(id)),
      title: definition.title,
      status: definition.status,
      detail,
      instance,
      ...validatedContext, // Spread validated context into problem
    } as Problem & InferProblemContext<TProblems[TId]>;
  }

  /**
   * Build type URI for a problem ID
   */
  buildTypeUri(problemId: string): string {
    return `${this.config.baseUri}/${this.config.service}/api/v${this.config.version}/${problemId}`;
  }

  /**
   * Next.js API route handler for listing all problems
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
   */
  handleGetProblemSchema = (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { id } = req.query;

      if (typeof id !== 'string' || !(id in this.problems)) {
        return res.status(404).json({
          type: this.buildTypeUri('problem_not_found'),
          title: 'Problem Not Found',
          status: 404,
          detail: `Problem with ID '${id}' not found`,
        });
      }

      const definition = this.problems[id as keyof TProblems];

      // Convert Zod schema to JSON Schema using native Zod v4 method
      const jsonSchema = definition.schema.toJSONSchema();

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

/**
 * Helper type to extract the problem ID union from a registry
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic constraint requires any for type inference
export type ProblemIds<T extends ProblemRegistry<any>> = T extends ProblemRegistry<infer P> ? keyof P : never;
