import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

/**
 * Zod schema for HTTP Error problem additional properties
 */
const HttpErrorSchema = z.object({
  method: z.string().optional().describe('HTTP method used (GET, POST, etc.)'),
  url: z.string().optional().describe('The URL that caused the error'),
  statusCode: z.number().describe('HTTP status code returned'),
  responseBody: z.string().optional().describe('Raw response body content'),
});

/**
 * TypeScript type inferred from schema
 */
type HttpErrorContext = z.infer<typeof HttpErrorSchema>;

/**
 * HTTP Error problem definition
 */
const httpErrorDefinition: ZodProblemDefinition<typeof HttpErrorSchema> = {
  id: 'http_error',
  title: 'HTTP Error',
  version: 'v1',
  description: 'An HTTP error occurred while communicating with an external service.',
  status: 418, // I'm a teapot - placeholder for HTTP errors
  schema: HttpErrorSchema,
  createDetail: context => {
    const method = context.method ? `${context.method} ` : '';
    const url = context.url ? `${context.url} ` : '';
    const body = context.responseBody ? `: ${context.responseBody}` : '';
    return `HTTP ${context.statusCode} error for ${method}${url}${body}`.trim();
  },
};

export { type HttpErrorContext, httpErrorDefinition, HttpErrorSchema };
