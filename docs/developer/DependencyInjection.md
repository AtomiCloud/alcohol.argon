# Dependency Injection Framework

## Overview

The AtomiCloud dependency injection framework provides a unified provider system that orchestrates all application services, configuration, error handling, and observability in a structured hierarchy.

## Core Architecture

### AtomiProvider

The `AtomiProvider` serves as the root dependency injection container, orchestrating all application providers:

```typescript
import { AtomiProvider } from '@/adapters/atomi/Provider';

// In _app.tsx
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AtomiProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AtomiProvider>
  );
}
```

### Provider Hierarchy

The AtomiProvider establishes this provider chain (outer to inner):

1. **LandscapeProvider** - Environment and landscape detection
2. **BridgedConfigProvider** - Configuration management with environment-specific settings
3. **BridgedProblemReporterProvider** - Error reporting infrastructure (Faro integration)
4. **BridgedProblemProvider** - Problem/error handling system with RFC 7807 support
5. **FrontendObservability** - Grafana Faro observability integration (automatic setup)
6. **BridgedApiClientProvider** - API client dependency injection with Result monads

**Note**: Error boundaries, loading states, and empty states are managed through separate context providers that are used independently as needed.

## Bridged Providers

### BridgedConfigProvider

Provides configuration access throughout the app:

```typescript
import { useConfig } from '@/lib/config';

function MyComponent() {
  const { common, client } = useConfig();

  // Access landscape-specific configuration
  const appName = common.app.name;
  const landscape = client.landscape;
  const faroConfig = client.faro;

  return (
    <div>
      <h1>{appName}</h1>
      <p>Environment: {landscape}</p>
      <p>Faro enabled: {faroConfig.enabled ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### BridgedProblemReporterProvider

Enables error reporting with automatic Faro integration:

```typescript
import { useProblemReporter } from '@/adapters/problem-reporter/providers';

function MyComponent() {
  const problemReporter = useProblemReporter();

  const handleAction = async () => {
    const result = await riskyOperation(); // Returns Result<T, Error>

    result.match({
      ok: data => {
        // Handle success
      },
      err: error => {
        problemReporter.pushError(error, {
          source: 'user-action',
          context: { userId, action: 'submit-form' },
        });
      },
    });
  };
}
```

### BridgedApiClientProvider

Provides configured API clients with Result monad integration:

```typescript
// For server-side API access, use withServerSideAtomi
export const getServerSideProps = withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  // API clients are pre-configured and return Result monads
  const result = await apiTree.alcohol.zinc.vUserList({ version: '1.0' });

  return result.match({
    ok: users => ({ props: { users } }),
    err: problem => ({ props: { error: problem } }),
  });
});

// For client-side, the provider makes clients available through the adapter system
```

## Global Error Boundary Integration

The framework includes a `GlobalErrorBoundary` that automatically catches React errors and displays the enhanced `ErrorPage`:

```typescript
// Automatic integration - no setup required
<GlobalErrorBoundary ErrorComponent={ErrorPage}>
  <YourAppContent />
</GlobalErrorBoundary>
```

**Features:**

- Automatic error catching at the React boundary level
- Integration with error reporting system
- Enhanced ErrorPage with animations and JSON export
- Graceful error recovery mechanisms

## Configuration Integration

The DI system automatically loads environment-specific configuration:

```typescript
// Automatic landscape detection and config loading
// Configurations loaded from:
// - src/config/common/lapras.settings.yaml (local)
// - src/config/common/pichu.settings.yaml (dev)
// - src/config/common/pikachu.settings.yaml (staging)
// - src/config/common/raichu.settings.yaml (production)
```

## Error Context Integration

The framework provides application-level error state management:

```typescript
import { useErrorContext } from '@/contexts/ErrorContext';

function MyComponent() {
  const { currentError, setError, clearError } = useErrorContext();

  // Trigger application-wide error state
  const handleError = (error: Problem) => {
    setError(error); // This will be caught by ContentManager
  };
}
```

## Benefits

1. **Unified Setup**: Single provider handles all application dependencies
2. **Automatic Configuration**: Environment-specific config loading without manual setup
3. **Integrated Observability**: Automatic Faro integration with proper configuration
4. **Centralized Error Handling**: Unified error reporting and user experience
5. **Type Safety**: Full TypeScript support throughout the provider chain
6. **Testability**: Easy to mock providers for testing

## Usage Patterns

### Basic Setup

```typescript
// _app.tsx - Minimal setup required
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AtomiProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AtomiProvider>
  );
}
```

### Accessing Services

```typescript
// In any component - services are automatically available
import { useConfig } from '@/lib/config';
import { useProblemReporter } from '@/adapters/problem-reporter/providers';
import { useErrorContext } from '@/lib/content/providers';

function MyFeature() {
  const { common, client } = useConfig();
  const problemReporter = useProblemReporter();
  const { setError } = useErrorContext();

  // API clients are accessed through server-side adapters or specific hooks
  // Configuration is environment-aware
  // Problem reporting integrates with Faro automatically

  return (
    <div>
      <h1>{common.app.name}</h1>
      <p>Environment: {client.landscape}</p>
    </div>
  );
}
```

### Error Handling

```typescript
// Automatic error handling at multiple levels:
// 1. Result monads → Never throw, always return Result<T, Problem>
// 2. Problem reporting → Automatic Faro integration for tracking
// 3. Content management → useContent handles Result states automatically
// 4. Global boundaries → React error boundaries catch unexpected errors

// Example of the flow:
const result = await apiTree.service.method(params); // Result<T, Problem>
result.match({
  ok: data => {
    // Handle success case
    setContent(data);
  },
  err: problem => {
    // Automatically reported to Faro
    problemReporter.pushError(problem, { source: 'api-call' });
    // Can trigger error UI through content system
  },
});
```

This dependency injection framework eliminates boilerplate setup while providing a robust, observable, and maintainable application architecture.
