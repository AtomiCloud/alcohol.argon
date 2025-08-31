# Problem Reporter System

## Overview

Error reporting system that integrates with Grafana Faro
for comprehensive error tracking and observability.

## Core Components

- **ProblemReporter**: Core error reporting interface
- **FaroErrorReporter**: Faro-specific implementation
- **NoOpErrorReporter**: Fallback when Faro unavailable

## Usage

### Basic Error Reporting

```typescript
import { useProblemReporter } from '@/adapters/problem-reporter/providers';

function MyComponent() {
  const problemReporter = useProblemReporter();

  try {
    await riskyOperation();
  } catch (error) {
    problemReporter.pushError(error, {
      source: 'user-action',
      context: { userId: '123', action: 'submit-form' },
    });
  }
}
```

### Error with Problem Details

```typescript
const problem = {
  type: 'validation_error',
  title: 'Invalid Input',
  status: 400,
  detail: 'Email format is invalid',
};

problemReporter.pushError(new Error('Validation failed'), {
  source: 'form-validation',
  problem,
  context: { field: 'email', value: userInput },
});
```

### Custom Error Context

```typescript
problemReporter.pushError(error, {
  source: 'api-client',
  problem: {
    type: 'network_error',
    title: 'Network Request Failed',
    status: 503,
    detail: 'Unable to connect to server',
  },
  context: {
    url: '/api/users',
    method: 'POST',
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  },
});
```

## Integration Points

### Automatic Integration

ProblemReporter is automatically configured through AtomiProvider:

```typescript
// No setup required
<BridgedProblemReporterProvider>
  <YourApp />
</BridgedProblemReporterProvider>
```

### ContentManager Integration

ContentManager automatically uses ProblemReporter for navigation errors:

```typescript
const handleRouteChangeError = (err: Error) => {
  const problem = {
    type: 'navigation_error',
    title: 'Navigation Error',
    status: 500,
    detail: err.message,
  };

  problemReporter.pushError(err, {
    source: 'navigation-error',
    problem,
  });
};
```

### API Client Integration

```typescript
import { useApiClient } from '@/lib/api/providers';

function MyComponent() {
  const apiClient = useApiClient();
  const problemReporter = useProblemReporter();

  const fetchData = async () => {
    try {
      return await apiClient.get('/data');
    } catch (error) {
      problemReporter.pushError(error, {
        source: 'api-request',
        context: { endpoint: '/data', method: 'GET' },
      });
      throw error; // Re-throw for component handling
    }
  };
}
```

## Error Reporter Types

### FaroErrorReporter

Used when Faro is available and configured:

```typescript
interface FaroErrorReporter extends ProblemReporter {
  pushError(error: Error, meta: ErrorMeta): void;
  // Automatically includes trace correlation
  // Adds user context if available
  // Sends to Grafana Cloud
}
```

### NoOpErrorReporter

Fallback when Faro unavailable:

```typescript
interface NoOpErrorReporter extends ProblemReporter {
  pushError(error: Error, meta: ErrorMeta): void;
  // Logs to console only
  // No external reporting
}
```

## Error Metadata Structure

```typescript
interface ErrorMeta {
  source: string; // Error origin identifier
  problem?: Problem; // RFC 7807 problem details
  context?: Record<string, any>; // Additional context
}

interface Problem {
  type: string; // Error type identifier
  title: string; // Human-readable summary
  status: number; // HTTP status code
  detail: string; // Detailed description
  instance?: string; // Problem instance identifier
}
```

## Best Practices

### Error Sources

Use consistent source identifiers:

```typescript
// Good - descriptive sources
problemReporter.pushError(error, { source: 'form-validation' });
problemReporter.pushError(error, { source: 'api-client' });
problemReporter.pushError(error, { source: 'navigation-error' });

// Avoid - generic sources
problemReporter.pushError(error, { source: 'error' });
```

### Context Information

Include relevant context for debugging:

```typescript
problemReporter.pushError(error, {
  source: 'checkout-process',
  context: {
    step: 'payment',
    userId: user.id,
    amount: order.total,
    paymentMethod: selectedMethod,
  },
});
```

### Problem Details

Use structured problem details:

```typescript
const problem = {
  type: 'https://example.com/problems/payment-declined',
  title: 'Payment Declined',
  status: 402,
  detail: 'The payment method was declined by the processor',
  instance: `/orders/${orderId}/payment`,
};
```

## Faro Integration

When Faro is configured, errors include:

- **Trace Correlation**: Links errors to distributed traces
- **User Context**: Automatic user session information
- **Performance Data**: Browser performance metrics
- **Custom Attributes**: Additional metadata for filtering

```typescript
// Automatic trace correlation in Faro reports
problemReporter.pushError(error, {
  source: 'user-checkout',
  context: { orderId: '123' },
});
// Results in Faro with trace ID, user session, and custom context
```
