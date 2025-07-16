# User Space Problem Definitions

This directory contains your application-specific RFC 7807 Problem Details definitions using Zod schemas with compile-time type safety.

## Quick Start

### 1. Define a New Problem

Create a new file in `definitions/` directory:

```typescript
// src/problems/definitions/my-custom-error.ts
import { z } from 'zod';
import type { ZodProblemDefinition } from '@/lib/problem/core/types';

export const MyCustomErrorSchema = z.object({
  resourceId: z.string().describe('ID of the resource that caused the error'),
  reason: z.string().describe('Specific reason for the error'),
  retryAfter: z.number().optional().describe('Seconds to wait before retrying'),
});

export type MyCustomErrorContext = z.infer<typeof MyCustomErrorSchema>;

export const myCustomErrorDefinition: ZodProblemDefinition<typeof MyCustomErrorSchema> = {
  id: 'my_custom_error',
  title: 'MyCustomError',
  version: 'v1',
  description: 'A custom error for demonstration purposes.',
  status: 422,
  schema: MyCustomErrorSchema,
  createDetail: context => `Custom error for resource ${context.resourceId}: ${context.reason}`,
};
```

### 2. Register the Problem

Add to the `PROBLEM_DEFINITIONS` object in `registry.ts`:

```typescript
import { myCustomErrorDefinition } from './definitions/my-custom-error';

// Add to the PROBLEM_DEFINITIONS constant:
const PROBLEM_DEFINITIONS = {
  entity_conflict: entityConflictDefinition,
  unauthorized: unauthorizedDefinition,
  validation_error: validationErrorDefinition,
  my_custom_error: myCustomErrorDefinition, // Add here
} as const;
```

### 3. Export for Use

Add to `index.ts`:

```typescript
export { myCustomErrorDefinition, type MyCustomErrorContext } from './definitions/my-custom-error';
```

### 4. Use in Your Application

```typescript
import { problemRegistry, type MyCustomErrorContext } from '@/problems';

// Create a problem instance with full type safety
const context: MyCustomErrorContext = {
  resourceId: 'user-123',
  reason: 'Invalid email format',
  retryAfter: 60,
};

// TypeScript will validate the problem ID and context type
const problem = problemRegistry.createProblem(
  'my_custom_error', // ✅ Type-safe - only valid IDs accepted
  context, // ✅ Type-safe - context must match schema
  'Additional details here', // optional
);

// problem is automatically typed as: Problem & MyCustomErrorContext
console.log(problem.resourceId); // ✅ TypeScript knows this field exists
console.log(problem.reason); // ✅ TypeScript knows this field exists

// Use with Result monad
const result = Err(problem);
```

## Features

### ✅ **Compile-Time Type Safety**

Problem IDs are validated at compile time - invalid IDs will cause TypeScript errors.

### ✅ **Strongly Typed Contexts**

Context parameters are automatically typed based on the problem ID you provide.

### ✅ **Zod Schema Validation**

Context is automatically validated against the Zod schema before creating problems.

### ✅ **Auto-Generated JSON Schema**

The error portal API automatically generates JSON Schema from your Zod definitions.

### ✅ **TypeScript Types**

Use `z.infer<typeof YourSchema>` to get fully typed context objects.

### ✅ **Context Spreading**

Additional properties from context are spread directly into the Problem object.

### ✅ **Custom Detail Generation**

Use `createDetail` function to generate meaningful error messages.

### ✅ **Static Problem Registry**

All problems are defined in a static object, making them discoverable at build time.

### ✅ **API Integration**

Problems are automatically exposed via:

- `GET /api/v1.0/error-info` - List all problem IDs
- `GET /api/v1.0/error-info/{id}` - Get JSON schema for specific problem

## API Response Examples

### List Problems

```bash
GET /api/v1.0/error-info
```

```json
["entity_conflict", "unauthorized", "validation_error", "my_custom_error"]
```

### Get Problem Schema

```bash
GET /api/v1.0/error-info/entity_conflict
```

```json
{
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "EntityConflict",
    "type": "object",
    "description": "This error means an unique field conflict, or/and already exists.",
    "additionalProperties": false,
    "properties": {
      "TypeName": {
        "type": "string",
        "description": "The Full Name of the type of entity that is in conflict"
      },
      "AssemblyQualifiedName": {
        "type": "string",
        "description": "The AssemblyQualifiedName of the entity that is in conflict"
      }
    },
    "required": ["TypeName", "AssemblyQualifiedName"]
  },
  "id": "entity_conflict",
  "title": "EntityConflict",
  "version": "v1"
}
```

## Best Practices

### 1. **Descriptive IDs**

Use snake_case IDs that clearly identify the error: `user_not_found`, `payment_failed`, `rate_limit_exceeded`

### 2. **Meaningful Schemas**

Add `.describe()` to all Zod fields to generate useful JSON Schema documentation

### 3. **Appropriate Status Codes**

Choose HTTP status codes that match the problem:

- `400` - Bad Request / Validation errors
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### 4. **Version Management**

Update the `version` field when making breaking changes to problem schemas

### 5. **Detail Functions**

Create helpful `createDetail` functions that provide actionable error messages

## Type Safety Examples

### Compile-Time ID Validation

```typescript
// ✅ Valid - TypeScript accepts this
const problem1 = problemRegistry.createProblem('validation_error', context);

// ❌ Invalid - TypeScript error at compile time
const problem2 = problemRegistry.createProblem('invalid_id', context);
//                                               ^^^^^^^^^^
// Error: Argument of type '"invalid_id"' is not assignable to parameter of type 'ProblemId'
```

### Strongly Typed Context

```typescript
// TypeScript automatically infers the correct context type
const problem = problemRegistry.createProblem('validation_error', {
  field: 'email', // ✅ Required field
  constraint: 'Invalid', // ✅ Required field
  value: 'test', // ✅ Optional field
  code: 'invalid', // ✅ Optional field
  // invalid: true       // ❌ TypeScript error - not part of ValidationErrorContext
});
```

### Strongly Typed Return Values

```typescript
// Return type is automatically inferred as Problem & ValidationErrorContext
const problem = problemRegistry.createProblem('validation_error', {
  field: 'email',
  constraint: 'Email is required',
});

// TypeScript knows these fields exist
console.log(problem.field); // ✅ string
console.log(problem.constraint); // ✅ string
console.log(problem.value); // ✅ unknown | undefined
console.log(problem.code); // ✅ string | undefined
```

## Integration with Result Monads

All problems work seamlessly with the `Result<T, Problem>` monad system:

```typescript
import { Ok, Err } from '@/lib/monads/result';
import { problemRegistry } from '@/problems';

async function validateUser(userData: unknown): Promise<Result<User, Problem>> {
  try {
    const user = await userService.create(userData);
    return Ok(user);
  } catch (error) {
    if (error.code === 'DUPLICATE_EMAIL') {
      // Full type safety - ID and context are validated
      const problem = problemRegistry.createProblem('entity_conflict', {
        TypeName: 'User',
        AssemblyQualifiedName: 'MyApp.Models.User',
      });
      return Err(problem);
    }

    // Library catch-all for unknown errors
    const problem = problemTransformer.fromUnknown(error);
    return Err(problem);
  }
}
```
