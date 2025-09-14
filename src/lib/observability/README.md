# Observability Library

## Overview

Grafana Faro integration providing RUM, distributed tracing, error reporting, and performance monitoring with automatic instrumentation for Next.js applications.

## Architecture

```
observability/
├── index.ts                   # Public exports and utilities
├── FrontendObservability.tsx  # Faro initialization component
└── faro-error-reporter.ts     # Error reporting integration
```

## Core Components

### FrontendObservability Component

Initializes Faro with LPSM service tree naming and landscape-specific configuration:

- Conditional initialization (respects config flags)
- Automatic naming: `${module}.${service}.${platform}`
- Build version tracking for deployment correlation
- Environment-specific settings per landscape

### FaroErrorReporter Class

```typescript
class FaroErrorReporter {
  pushError(error: unknown, context: { source: string, problem?: Problem }): void
  pushLog(level: 'info'|'warn'|'error'|'debug', message: string, context?: Record<string, any>): void
}
```

Integrates with Problem Details system and adds trace correlation.

## Features

### Automatic Instrumentation
- HTTP requests (fetch calls)
- Next.js router navigation
- React component rendering
- User interactions and form submissions

### Distributed Tracing
- OpenTelemetry-compatible spans
- Automatic trace context propagation
- Custom business logic spans via `faro.api.getOTEL()`

### Performance Monitoring
- Core Web Vitals (LCP, FID, CLS, TTFB)
- Resource loading metrics
- Memory usage patterns
- Custom performance measurements

### Error Tracking
- JavaScript exceptions and promise rejections
- Context enrichment with user session, navigation history
- Problem Details integration for structured errors

## Configuration

Landscape-specific settings:

```typescript
const faroConfig = {
  lapras: { enabled: true, debug: true, samplingRate: 1.0 },
  pichu: { enabled: true, debug: true, samplingRate: 1.0 },
  pikachu: { enabled: true, debug: false, samplingRate: 0.5 },
  raichu: { enabled: true, debug: false, samplingRate: 0.1 }
}
```

## Integration Points

### Problem Details System
Automatic error conversion and reporting with trace correlation.

### Content System
Performance tracking for content loading states with timing metrics.

### API Clients
Automatic instrumentation of all API calls with request/response metrics.

## Extension Points

### Custom Metrics
```typescript
faro.api?.pushEvent('business_event', { userId, action, metadata })
faro.api?.pushMeasurement({ name: 'operation_duration', value: ms })
```

### User Context
```typescript
faro.api?.setUser({ id, email, attributes: { plan, tenant } })
```