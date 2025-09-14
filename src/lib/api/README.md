# API Library

## Overview

Type-safe wrapper for swagger-typescript-api generated clients with automatic Result monad transformation and RFC 7807 Problem Details integration.

## Architecture

```
api/
├── core/
│   ├── swagger-adapter.ts    # Core client transformation
│   └── adapter.ts            # Module builder
└── providers/
    └── index.ts              # React context providers
```

## Key Features

- All API calls return `Result<T, Problem>` instead of throwing
- Automatic Problem Details conversion from API errors
- Recursive proxy wrapping of swagger clients
- LPSM service tree organization
- Method signature preservation with Result return types

## Core Components

### SwaggerAdapter

Transforms swagger-typescript-api clients to return Result monads:

```typescript
function createSafeApiClient<T>(apiClient: T, config: SwaggerAdapterConfig): SafeApiClient<T>
```

- Recursive proxy wrapping of nested methods
- Automatic error conversion to Problem Details
- Method caching for performance
- Type preservation with Result return types

### Client Tree System

Hierarchical API organization following LPSM:

```typescript
type ClientTree = Record<string, Record<string, Record<string, any>>>
type ApiTree<T> = { [Platform]: { [Service]: SafeApiClient<Service> } }
```

### Provider System

```typescript
const { ApiProvider, useSwaggerClients } = createApiProvider<ClientTree, Problems>()

// Usage
const clients = useSwaggerClients()
const result = await clients.alcohol.zinc.api.vUserList({ version: '1.0' })
```

## Integration Points

### Problem Transformer Integration

API errors are automatically transformed via the Problem system:

```typescript
const config: SwaggerAdapterConfig = {
  instance: 'alcohol-zinc-api',
  problemTransformer: problemTransformer  // From @/lib/problem
}
```

**Error Flow**:
1. API method throws error (HTTP 400, 500, etc.)
2. `wrapApiMethod` catches error
3. `problemTransformer.fromSwaggerError()` converts to Problem Details
4. Returns `Err(Problem)` instead of throwing

### Module System Integration

APIs are provided as modules through the module provider system:

```typescript
const apiInput: ApiModuleInput<ClientTree, Problems> = {
  defaultInstance: 'alcohol-api',
  problemTransformer: problemTransformer,
  clientTree: clients
}

// Built via apiBuilder in adapter.ts
const apiTree = apiBuilder(apiInput)
```

### Result Monads Integration

All API calls return Result monads for functional error handling:

```typescript
// Instead of try/catch:
try {
  const users = await api.users.list()
} catch (error) {
  // Handle error
}

// Use Result pattern:
const result = await api.users.list()
result.match({
  ok: users => console.log('Success:', users),
  err: problem => console.error('Problem:', problem.detail)
})
```

## Type System

### SafeApiClient Transformation

The type system preserves method signatures while changing return types:

```typescript
// Original swagger client method
getUserById(id: string): Promise<User>

// Transformed safe client method
getUserById(id: string): Promise<Result<User, Problem>>
```

**Recursive Type Mapping**:
- Async functions → Wrapped with Result
- Objects → Recursively transformed
- Primitives → Preserved as-is

### Generic Constraints

```typescript
// ClientTree: Structure for API organization
type ClientTree = Record<string, Record<string, Record<string, any>>>

// ProblemDefinitions: Error type definitions
type ProblemDefinitions = Record<string, unknown>

// AsyncFunction: Method signature constraint
type AsyncFunction<TArgs extends unknown[], TReturn> =
  (...args: TArgs) => Promise<TReturn>
```

## Performance Considerations

### Proxy Caching

Method wrapping uses caching to avoid performance overhead:

```typescript
const cache = new Map<string | symbol, any>()

// Cache wrapped methods by property name
if (cache.has(prop)) {
  return cache.get(prop)
}
cache.set(prop, wrappedMethod)
```

### Lazy Transformation

APIs are transformed on-demand rather than eagerly:
- Only accessed methods are wrapped
- Nested objects are proxied but not pre-processed
- Original client methods are bound to preserve `this` context

## Extension Points

### Custom Problem Transformers

Implement `ProblemTransformer<T>` interface for domain-specific error handling:

```typescript
interface ProblemTransformer<T extends ProblemDefinitions> {
  fromSwaggerError(error: unknown, instance: string): Promise<Problem>
}
```

### Additional Client Types

Extend beyond swagger-typescript-api clients by implementing compatible interfaces:

```typescript
// Must have async methods that can be wrapped
interface CompatibleClient {
  someMethod(...args: any[]): Promise<any>
}
```

## Development Patterns

### API Client Registration

1. Generate client with swagger-typescript-api
2. Add to ClientTree structure
3. Register in adapter with appropriate configuration
4. Access via `useSwaggerClients()` hook

### Error Handling Strategy

1. **Local Handling**: Use `Result.match()` for immediate error handling
2. **Global Handling**: Let errors bubble to Problem Reporter system
3. **Contextual Errors**: Use Problem Details for user-facing error messages
4. **Logging**: Errors automatically reported via observability system