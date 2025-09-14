# Faro Observability

## Overview

Automatic error reporting and performance monitoring integrated with Grafana Faro. Works automatically through AtomiProvider - no setup required.

**Key Features:**

- Automatic error reporting
- Performance metrics
- Distributed tracing
- User session tracking

## How to Use

Faro works automatically with AtomiProvider - no additional setup needed.

```typescript
// Automatic setup through AtomiProvider
<AtomiProvider>
  <YourApp />
</AtomiProvider>
```

### Manual Error Reporting

Use ProblemReporter for manual error tracking (automatically sent to Faro):

```typescript
import { useProblemReporter } from '@/adapters/problem-reporter/providers';

function MyComponent() {
  const problemReporter = useProblemReporter();

  const handleError = () => {
    problemReporter.pushError(new Error('Something failed'), {
      source: 'user-action',
      context: {
        userId: user.id,
        action: 'checkout',
        step: 'payment',
      },
    });
  };

  return <button onClick={handleError}>Report Error</button>;
}
```

### Custom Events

```typescript
import { useFaro } from '@/lib/observability';

function MyComponent() {
  const { faro } = useFaro();

  const trackUserAction = () => {
    faro?.match({
      ok: f => f.api.pushEvent('button_click', {
        button: 'purchase',
        section: 'product',
        userId: user.id,
      }),
      err: () => {}, // Graceful fallback
    });
  };

  return <button onClick={trackUserAction}>Track Action</button>;
}
```

## Configuration

Faro is configured per landscape in client config files:

```yaml
# src/config/client/pichu.settings.yaml
faro:
  enabled: true
  collectorurl: 'https://faro-collector-pichu.grafana.net/collect'
  sessionTracking:
    enabled: true
    samplingRate: 1.0  # 100% in dev

# src/config/client/raichu.settings.yaml
faro:
  enabled: true
  collectorurl: 'https://faro-collector-raichu.grafana.net/collect'
  sessionTracking:
    enabled: true
    samplingRate: 0.1  # 10% in production
```
