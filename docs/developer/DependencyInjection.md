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
3. **BridgedProblemReporterProvider** - Error reporting infrastructure
4. **BridgedProblemProvider** - Problem/error handling system
5. **GlobalErrorBoundary** - React error boundary with ErrorPage integration
6. **ErrorProvider** - Application-level error state management
7. **FrontendObservability** - Grafana Faro observability integration
8. **BridgedApiClientProvider** - API client dependency injection

## Bridged Providers

### BridgedConfigProvider

Provides configuration access throughout the app:

```typescript
import { useConfig } from '@/lib/config';

function MyComponent() {
  const { clientConfig, serverConfig } = useConfig();

  // Access landscape-specific configuration
  const apiUrl = clientConfig.api.baseUrl;
  const faroConfig = clientConfig.faro;
}
```

### BridgedProblemReporterProvider

Enables error reporting with automatic Faro integration:

```typescript
import { useProblemReporter } from '@/adapters/problem-reporter/providers';

function MyComponent() {
  const problemReporter = useProblemReporter();

  try {
    // risky operation
  } catch (error) {
    problemReporter.pushError(error, {
      source: 'user-action',
      context: { userId, action: 'submit-form' },
    });
  }
}
```

### BridgedApiClientProvider

Provides configured API clients:

```typescript
import { useApiClient } from '@/lib/api/providers';

function MyComponent() {
  const apiClient = useApiClient();

  // Use configured client with automatic error handling
  const result = await apiClient.get('/users');
}
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
function MyFeature() {
  const config = useConfig();
  const problemReporter = useProblemReporter();
  const apiClient = useApiClient();
  const { setError } = useErrorContext();

  // Use services as needed
}
```

### Error Handling

```typescript
// Automatic error handling at multiple levels:
// 1. React boundary errors → GlobalErrorBoundary → ErrorPage
// 2. Application errors → ErrorContext → ContentManager
// 3. API errors → ProblemReporter → Faro + ErrorPage
```

This dependency injection framework eliminates boilerplate setup while providing a robust, observable, and maintainable application architecture.
