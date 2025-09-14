# Content Library

State management for loading, content, error, and empty states with Result monad integration and Problem Details support.

## Architecture

```
content/
├── components/
│   ├── ContentManager.tsx        # Full page state manager
│   └── FreeContentManager.tsx    # Component-level state manager
└── providers/
    ├── LoadingContext.tsx        # Reference-counted loading state
    ├── ErrorContext.tsx          # Global error state (Problem Details)
    ├── EmptyContext.tsx          # Empty state with descriptions
    ├── useContent.ts             # Main content loading hook
    └── useErrorHandler.ts        # Error transformation utilities
```

## Core Types

```typescript
type AtomiContent<T, Y> = Result<T, Y> | Promise<Result<T, Y>>

interface ContentSetting<T, Y> {
  defaultContent?: ResultSerial<T, Y>     // SSR initial content
  emptyChecker?: (t: T) => boolean        // Custom empty detection
  loader?: ContentLoaderFn                // Custom loading control
  loaderDelay?: number                    // Debounced loading start
  empty?: ContentEmptyFn                  // Custom empty state control
  error?: (u: unknown) => void            // Custom error handling
  notFound?: string                       // Empty state message
}
```

## Content Hook

Central hook for content loading with comprehensive state management:

```typescript
function useContent<T, Y>(input: AtomiContent<T, Y>, setting?: ContentSetting<T, Y>): T | undefined
```

**State Flow**: Initialization → Loading (with delay) → Result Processing → Empty Detection → Race Prevention

## Context Providers

### Loading Context - Reference-counted loading state

```typescript
interface LoadingContextType {
  loading: boolean
  startLoading: () => void    // counter++
  stopLoading: () => void     // counter--
}
// loading = counter > 0
```

### Error Context - Global error state with Problem Details

```typescript
interface ErrorContextType {
  currentError: Problem | null
  setError: (error: Problem | null) => void
  clearError: () => void
}
```

### Empty Context - Empty state with descriptive messaging

```typescript
interface EmptyContextType {
  desc?: string
  setDesc: (desc: string) => void
  clearDesc: () => void
}
```

## Content Managers

### ContentManager - Full page state manager with Next.js router integration

```typescript
type ContentState = 'loading' | 'content' | 'error' | 'empty'

// State priority: error > loading > empty > content
useEffect(() => {
  if (error) return setState('error')
  if (loading) return setState('loading')
  if (desc) return setState('empty')
  setState('content')
}, [error, loading, desc])
```

**Router Integration**: Handles route changes, navigation errors, and state transitions.

### FreeContentManager - Lightweight component-level state control

```typescript
interface ContentManagerProps {
  LoadingComponent: React.ComponentType
  EmptyComponent: React.ComponentType<{desc?: string}>
  loadingState: boolean
  emptyState?: string
  children: React.ReactNode
}
```

## Error Handling

### useErrorHandler - Problem Details transformation

```typescript
function useErrorHandler() {
  return {
    throwError: (error: Error | string) => void      // Convert to Problem
    throwProblem: (problem: Problem) => void         // Direct Problem
    throwUnknown: (error: unknown) => void           // Convert any error
    clearError: () => void
  }
}
```

**Pipeline**: Error Input → Problem Transformation → Context Integration → UI Rendering

## Integration

### Result Monads
```typescript
const users = useContent(api.users.list())  // Result<User[], Problem>
const asyncUsers = useContent(loadUsers())   // Promise<Result<User[], Problem>>
```

### SSR Support
```typescript
function UserList({ initialUsers }: { initialUsers: ResultSerial<User[], Problem> }) {
  const users = useContent(loadUsers(), {
    defaultContent: initialUsers  // Prevent initial loading
  })
}
```

### Next.js Router
```typescript
// Automatic integration in ContentManager:
// - Route start: clear empty, start loading
// - Route complete: stop loading, clear errors
// - Route error: convert to Problem Details
```

## Usage Patterns

### Basic Usage
```typescript
const data = useContent(api.getData())
```

### Custom Empty Logic
```typescript
const products = useContent(loadProducts(), {
  emptyChecker: products => products.filter(p => p.active).length === 0,
  notFound: 'No active products'
})
```

### Component-Level State
```typescript
<FreeContentManager
  LoadingComponent={Spinner}
  EmptyComponent={EmptyState}
  loadingState={isLoading}
  emptyState={emptyMessage}
>
  {content}
</FreeContentManager>
```