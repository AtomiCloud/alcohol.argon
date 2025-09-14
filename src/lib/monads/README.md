# Monads Library

## Overview

Result<T,E> and Option<T> functional programming primitives for safe 
error handling and null safety. Eliminates exceptions and null pointer 
errors with composable operations.

## Architecture

```
monads/
├── result.ts     # Result<T,E> monad for error handling
├── option.ts     # Option<T> monad for null safety
└── error.ts      # UnwrapError for unsafe operations
```

## Key Features

- Replace try/catch with Result<T,E> pattern
- Replace null/undefined with Option<T> pattern
- Chainable operations (map, andThen, match)
- Native Promise integration
- Network-safe serialization for SSR/API boundaries

## Result<T,E> Monad

### Core Result Interface

```typescript
type Result<T, E> = Ok<T> | Err<E>

function Ok<T, X = never>(val: T | Promise<T>): Result<T, X>
function Err<T, X>(error: X | Promise<X>): Result<T, X>

type ResultSerial<T, E> = ['ok', T] | ['err', E]
```

**Key Features**:
- **Type-Safe Errors**: Compile-time error type checking
- **Async Native**: Direct Promise<T> and Promise<E> support
- **Serializable**: Tuple format for network transfer
- **Pattern Matching**: Exhaustive match() method

### Result Operations

**Basic Construction**:
```typescript
// Success case
const success = Ok(42)
const asyncSuccess = Ok(Promise.resolve(42))

// Error case
const failure = Err('Something went wrong')
const asyncFailure = Err(Promise.reject(new Error('Async error')))
```

**Pattern Matching**:
```typescript
const result: Result<number, string> = Ok(42)

const output = await result.match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error}`
})
// output: "Success: 42"
```

**Chaining Operations**:
```typescript
const result = Ok(10)
  .map(x => x * 2)           // Ok(20)
  .andThen(x => x > 15 ? Ok(x) : Err('Too small'))  // Ok(20)
  .map(x => x.toString())    // Ok("20")
```

**Async Operations**:
```typescript
const asyncResult = Ok(fetch('/api/data'))
  .map(response => response.json())
  .andThen(data => data.valid ? Ok(data) : Err('Invalid data'))
```

### Result Utilities

**Multiple Results**:
```typescript
const results = await Res.all([
  apiCall1(),    // Result<User, Problem>
  apiCall2(),    // Result<Posts, Problem>
  apiCall3()     // Result<Settings, Problem>
])
// Result<[User, Posts, Settings], Problem[]>
```

**Async Creation**:
```typescript
const result = Res.async(async () => {
  const response = await fetch('/api/data')
  if (!response.ok) throw new Error('Failed')
  return response.json()
})
// Result<Data, Error>
```

**Serialization**:
```typescript
// For network transfer
const serialized = await result.serial()  // ['ok', data] or ['err', error]

// From serialized format
const deserialized = Res.fromSerial(serialized)
```

## Option<T> Monad

### Core Option Interface

```typescript
type Option<T> = Some<T> | None

function Some<T>(val: T | Promise<T>): Option<T>
function None<T>(): Option<T>

type OptionSerial<T> = [true, T] | [false, null]
```

**Key Features**:
- **Null Safety**: Eliminates null/undefined at compile time
- **Native Integration**: Easy conversion from nullable types
- **Composable**: Chain operations safely
- **Pattern Matching**: Exhaustive some/none handling

### Option Operations

**Construction**:
```typescript
// From nullable values
const some = Opt.fromNative('hello')      // Some('hello')
const none = Opt.fromNative(null)         // None
const undef = Opt.fromNative(undefined)   // None

// Direct construction
const directSome = Some(42)
const directNone = None<number>()
```

**Pattern Matching**:
```typescript
const option: Option<string> = Some('hello')

const result = await option.match({
  some: (value) => `Found: ${value}`,
  none: 'Nothing found'
})
// result: "Found: hello"
```

**Safe Operations**:
```typescript
const option = Some('hello world')
  .map(s => s.toUpperCase())          // Some('HELLO WORLD')
  .filter(s => s.includes('WORLD'))   // Some('HELLO WORLD')
  .map(s => s.length)                 // Some(11)

// Chain with Results
const safeResult = option.andThen(s =>
  s.length > 5 ? Ok(s) : Err('Too short')
)
```

**Default Values**:
```typescript
const value = option.unwrapOr('default value')
const lazyDefault = option.unwrapOr(() => expensiveDefault())
```

### Option Utilities

**Multiple Options**:
```typescript
const combined = Opt.all([
  Some('hello'),
  Some('world'),
  Some('!')
])
// Some(['hello', 'world', '!'])

const withNone = Opt.all([
  Some('hello'),
  None<string>(),
  Some('!')
])
// None
```

**Serialization**:
```typescript
const serialized = await option.serial()  // [true, value] or [false, null]
const deserialized = Opt.fromSerial(serialized)
```

## Advanced Patterns

### Error Boundary Integration

Results integrate with React error boundaries:

```typescript
// Convert exceptions to Results at boundaries
const safeApiCall = async (): Promise<Result<Data, Problem>> => {
  try {
    const data = await externalApi.getData()
    return Ok(data)
  } catch (error) {
    return Err(toProblem(error))
  }
}

// Use in components
const data = useContent(safeApiCall())
```

### Server-Side Serialization

Results serialize safely across SSR boundaries:

```typescript
// In getServerSideProps
export async function getServerSideProps() {
  const result = await apiCall()
  return {
    props: {
      data: await result.serial()  // Serializable tuple
    }
  }
}

// In component
function Page({ data }: { data: ResultSerial<User, Problem> }) {
  const result = Res.fromSerial(data)

  return result.match({
    ok: (user) => <UserProfile user={user} />,
    err: (problem) => <ErrorMessage problem={problem} />
  })
}
```

### Async Composition

Complex async workflows with monads:

```typescript
const userWorkflow = async (userId: string): Promise<Result<UserData, Problem>> => {
  return Ok(userId)
    .andThen(id => validateUserId(id))         // Result<string, Problem>
    .andThen(id => fetchUser(id))              // Result<User, Problem>
    .andThen(user => enrichUserData(user))     // Result<UserData, Problem>
    .andThen(data => cacheUserData(data))      // Result<UserData, Problem>
}
```

### Option Chaining

Safe property access:

```typescript
interface User {
  profile?: {
    settings?: {
      theme?: string
    }
  }
}

const getTheme = (user: User): Option<string> => {
  return Opt.fromNative(user.profile)
    .andThen(profile => Opt.fromNative(profile.settings))
    .andThen(settings => Opt.fromNative(settings.theme))
}

const theme = getTheme(user).unwrapOr('default-theme')
```

## Integration Points

### Problem Details Integration

Results naturally carry Problem Details:

```typescript
import type { Problem } from '@/lib/problem/core/types'

const apiResult: Result<User[], Problem> = await userApi.list()

apiResult.match({
  ok: (users) => setUsers(users),
  err: (problem) => {
    // problem is RFC 7807 Problem Details
    showError(problem.title, problem.detail)
  }
})
```

### Content System Integration

Monads integrate with content loading:

```typescript
const content = useContent(
  apiCall(),  // Returns Result<T, Problem>
  {
    defaultContent: await initialData.serial(),  // Serialized Result
    emptyChecker: (data) => data.length === 0
  }
)
```

### Configuration Integration

Options handle optional configuration:

```typescript
const config = {
  apiUrl: Opt.fromNative(process.env.API_URL),
  timeout: Opt.fromNative(process.env.TIMEOUT).map(Number),
  debug: Opt.fromNative(process.env.DEBUG).map(s => s === 'true')
}

const finalConfig = {
  apiUrl: config.apiUrl.unwrapOr('https://api.default.com'),
  timeout: config.timeout.unwrapOr(5000),
  debug: config.debug.unwrapOr(false)
}
```

## Performance Considerations

### Lazy Evaluation

Monads use promise-based lazy evaluation:

```typescript
// Operations are not executed until awaited
const result = Ok(expensiveOperation())  // Not executed yet
  .map(transform)                        // Not executed yet
  .andThen(validate)                     // Not executed yet

// Only executes when needed
const value = await result.match({       // Executes pipeline now
  ok: (v) => v,
  err: (e) => handleError(e)
})
```

### Memory Efficiency

Monads are lightweight wrappers:

```typescript
// Minimal memory overhead
const result = Ok(data)  // Just wraps data in Result class
const option = Some(value)  // Just wraps value in Option class
```

### Async Optimization

Native Promise integration avoids double-wrapping:

```typescript
// Efficient - direct Promise handling
const result = Ok(fetch('/api/data'))

// Less efficient - Promise in Promise
const inefficient = Ok(Promise.resolve(fetch('/api/data')))
```

## Error Handling Philosophy

### No Exceptions

Replace all exception-throwing code:

```typescript
// ❌ Exception-based code
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

// ✅ Result-based code
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err('Division by zero')
  return Ok(a / b)
}
```

### Explicit Error Handling

Make errors visible in type signatures:

```typescript
// ❌ Hidden error possibilities
async function fetchUser(id: string): Promise<User> {
  // Could throw network error, validation error, etc.
}

// ✅ Explicit error handling
async function fetchUser(id: string): Promise<Result<User, Problem>> {
  // All error cases are typed and visible
}
```

### Composable Error Propagation

Errors propagate automatically:

```typescript
const pipeline = Ok(rawData)
  .andThen(validateData)     // Could return Err
  .andThen(transformData)    // Skipped if previous Err
  .andThen(saveData)         // Skipped if previous Err
  .map(formatResponse)       // Skipped if previous Err

// Only need to handle error once at the end
```

## Development Patterns

### Boundary Conversion

Convert external APIs to monads at system boundaries:

```typescript
// Boundary function - converts exceptions to Results
const safeExternalCall = async (params: ApiParams): Promise<Result<Data, Problem>> => {
  try {
    const data = await externalLibrary.call(params)
    return Ok(data)
  } catch (error) {
    return Err(convertToProblem(error))
  }
}

// Internal code uses monads exclusively
const processData = (params: ApiParams) =>
  safeExternalCall(params)
    .andThen(validateData)
    .andThen(enrichData)
    .map(formatData)
```

### Testing with Monads

Monads make testing more explicit:

```typescript
describe('user service', () => {
  test('successful user creation', async () => {
    const result = await createUser({ name: 'Alice' })

    expect(result.isOk()).toBe(true)

    await result.match({
      ok: (user) => {
        expect(user.name).toBe('Alice')
        expect(user.id).toBeDefined()
      },
      err: () => fail('Should not be error')
    })
  })

  test('handles validation errors', async () => {
    const result = await createUser({ name: '' })

    expect(result.isErr()).toBe(true)

    await result.match({
      ok: () => fail('Should not be success'),
      err: (problem) => {
        expect(problem.type).toBe('validation_error')
      }
    })
  })
})
```

### Monad Laws

Results and Options follow monad laws for predictable behavior:

```typescript
// Left Identity: Ok(a).andThen(f) === f(a)
const a = 5
const f = (x: number) => Ok(x * 2)
assert(Ok(a).andThen(f).equals(f(a)))

// Right Identity: m.andThen(Ok) === m
const m = Ok(10)
assert(m.andThen(Ok).equals(m))

// Associativity: m.andThen(f).andThen(g) === m.andThen(x => f(x).andThen(g))
const g = (x: number) => Ok(x + 1)
assert(m.andThen(f).andThen(g).equals(m.andThen(x => f(x).andThen(g))))
```