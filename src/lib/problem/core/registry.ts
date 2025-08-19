import type { NextApiRequest, NextApiResponse } from 'next';
import type { InferProblemContext, Problem, ProblemConfig, ZodProblemDefinition } from './types';
import { DEFAULT_PROBLEMS, type DefaultProblems } from '@/lib/problem/core/definition';
import type { ProblemDefinitions } from '@/lib/problem/core/index';

type WithDefProb<T> = T & DefaultProblems;

/**
 * Type-safe problem registry with compile-time ID validation
 */
export class ProblemRegistry<TProblems extends ProblemDefinitions> {
  private readonly problems: WithDefProb<TProblems>;

  constructor(
    private config: ProblemConfig,
    problems: TProblems,
    defaultProblems: DefaultProblems = DEFAULT_PROBLEMS,
  ) {
    this.problems = {
      ...defaultProblems,
      ...problems,
    };
  }

  /**
   * Get a problem definition by ID with type safety
   */
  get<TId extends keyof WithDefProb<TProblems>>(id: TId): WithDefProb<TProblems>[TId] {
    return this.problems[id];
  }

  /**
   * Get all registered problem IDs
   */
  getAllIds(): Array<keyof WithDefProb<TProblems>> {
    return Object.keys(this.problems);
  }

  /**
   * Create a problem instance by ID with full type safety
   */
  createProblem<TId extends keyof WithDefProb<TProblems>>(
    id: TId,
    context: InferProblemContext<WithDefProb<TProblems>[TId]>,
    additionalDetail = '',
    instance = 'unknown',
  ): Problem & InferProblemContext<WithDefProb<TProblems>[TId]> {
    const definition = this.problems[id];

    // Validate context against Zod schema
    const parseResult = definition.schema.safeParse(context);
    if (!parseResult.success) {
      console.error('Failed to create problem', id, context, additionalDetail, instance);
      throw new Error(`Invalid context for problem ${String(id)}: ${parseResult.error.message}`);
    }
    const validatedContext = parseResult.data;

    // Generate detail message

    const detail = `${definition.createDetail ? definition.createDetail(context) : definition.title}. ${additionalDetail ?? ''}`;
    // Create problem with spread context
    return {
      type: this.buildTypeUri(String(id)),
      title: definition.title,
      status: definition.status,
      detail,
      instance,
      ...validatedContext, // Spread validated context into problem
    } as Problem & InferProblemContext<WithDefProb<TProblems>[TId]>;
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

      const definition = this.problems[id as keyof WithDefProb<TProblems>];

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
}
