# RFC 7807 Problem Details Library

This library provides a comprehensive solution for handling RFC 7807 Problem Details in HTTP APIs. It's designed to be extractable as a standalone package.

## Features

- ✅ RFC 7807 compliant Problem types
- ✅ Transformation from various error types to Problems
- ✅ HTTP response mapping for swagger-typescript-api
- ✅ Problem registry with Next.js API route integration
- ✅ Standard problem types for common errors
- ✅ DI-compatible design

## Quick Start

### 1. Basic Setup

```typescript
import { ProblemService } from '@/lib/problem';

const problemService = new ProblemService({
  baseUri: 'https://api.example.com',
  version: '1.0',
  service: 'my-service',
});
```

### 2. Transform Errors to Problems

```typescript
// From native Error
const error = new Error('Something went wrong');
const problem = problemService.transformer.fromError(error);

// From HTTP response
const httpError = {
  status: 404,
  statusText: 'Not Found',
  body: 'Resource not found',
  url: 'https://api.example.com/users/123',
};
const problem = problemService.transformer.fromHttpError(httpError);
```

### 3. Map HTTP Responses

```typescript
import { Ok, Err } from '@/lib/core/result';

// swagger-typescript-api response
const apiResponse = { data: null, error: 'Not found' };
const result = problemService.httpMapper.mapResponse(apiResponse);

// result is Result<T, Problem>
const finalResult = await result.match({
  ok: (data) => data,
  err: (problem) => {
    console.error('Problem:', problem.title, problem.detail);
    return null;
  },
});
```

### 4. Register Custom Problems

```typescript
problemService.registry.register({
  id: 'user_not_found',
  title: 'User Not Found',
  status: 404,
  schema: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      title: { type: 'string' },
      status: { type: 'number' },
      detail: { type: 'string' },
      userId: { type: 'string' },
    },
  },
  create: (context: { userId: string }, instance) => ({
    type: problemService.registry.buildTypeUri('user_not_found'),
    title: 'User Not Found',
    status: 404,
    detail: `User with ID ${context.userId} not found`,
    instance,
    userId: context.userId,
  }),
});
```

### 5. Next.js API Routes

```typescript
// pages/api/v1.0/error-info/index.ts
import { problemService } from '@/lib/problem-service';

export default problemService.registry.handleListProblems;
```

```typescript
// pages/api/v1.0/error-info/[id].ts
import { problemService } from '@/lib/problem-service';

export default problemService.registry.handleGetProblemSchema;
```

## API Reference

### Core Classes

#### ProblemTransformer
- `fromError(error: Error, instance?: string): Problem`
- `fromHttpError(details: HttpErrorDetails, instance?: string): Problem`
- `fromUnknown(error: unknown, instance?: string): Problem`

#### HttpResponseMapper
- `mapResponse<T>(response: SwaggerApiResponse<T>, instance?: string): Result<T, Problem>`
- `mapFetchResponse<T>(response: Response, instance?: string): Promise<Result<T, Problem>>`
- `mapAxiosError<T>(error: any, instance?: string): Result<T, Problem>`

#### ProblemRegistry
- `register<TContext>(definition: ProblemDefinition<TContext>): void`
- `get(id: string): ProblemDefinition | undefined`
- `createProblem<TContext>(id: string, context: TContext, instance?: string): Problem | null`
- `handleListProblems(req: NextApiRequest, res: NextApiResponse): void`
- `handleGetProblemSchema(req: NextApiRequest, res: NextApiResponse): void`

### Utility Functions

#### isProblem(obj: unknown): obj is Problem
Checks if an object has minimum RFC 7807 properties.

### Standard Problem Types

The library includes standard problem types for common scenarios:
- `HTTP_ERROR` - Generic HTTP errors
- `INTERNAL_ERROR` - Internal server errors
- `UNKNOWN_ERROR` - Unknown errors
- `NETWORK_ERROR` - Network connectivity issues
- `INVALID_REQUEST` - Invalid request parameters
- `PROBLEM_NOT_FOUND` - Problem registry errors

## Integration with Existing Code

This library is designed to work seamlessly with:
- **swagger-typescript-api** generated clients
- **Next.js API routes** for problem registry
- **Functional monads** (`Result<T, Problem>`)
- **DI systems** (constructor injection)

## Extractability

The library is designed to be easily extracted as a standalone package:
1. All dependencies are minimal and standard
2. Configuration is injected via constructor
3. No framework-specific code in core classes
4. Clear separation of concerns

## Configuration

```typescript
interface ProblemConfig {
  baseUri: string;  // e.g., "https://api.example.com"
  version: string;  // e.g., "1.0"
  service: string;  // e.g., "user-service"
}
```

Problem type URIs are generated as:
`{baseUri}/{service}/api/v{version}/{problemId}`

## Error Portal Integration

The library exposes two API endpoints for error portal integration:

- `GET /api/v1.0/error-info` - List all registered problems
- `GET /api/v1.0/error-info/{id}` - Get JSON schema for specific problem

These endpoints provide the necessary metadata for external documentation systems to understand and document your API's error responses.