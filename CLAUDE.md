# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**Frontend Stack**: Next.js 15 (Pages Router) + TypeScript + Tailwind CSS + shadcn/ui  
**Runtime**: Cloudflare Workers via OpenNext adapter  
**Development Environment**: Nix + Bun package manager  
**Key Features**: SSR search system, Lottie animation framework, URL state management

### Core Directory Structure

```
src/
├── pages/           # Next.js Pages Router (SSR pages + API routes)
├── components/      # React components
│   ├── ui/         # shadcn/ui components (Badge, Button, Card, Input)
│   ├── lottie/     # Lottie animation system (InlineLottie, presets)
│   └── error-page/ # Enhanced error page with animations
├── adapters/        # Dependency injection and provider system
│   ├── atomi/      # Main AtomiProvider and bridged providers
│   ├── external/   # External service adapters
│   ├── components/ # Adapter-level components (GlobalErrorBoundary)
│   └── problem-reporter/ # Error reporting system
├── clients/         # Generated API clients
│   └── alcohol/    # AtomiCloud service clients (zinc, etc.)
├── lib/            # Core libraries and utilities
│   ├── api/        # API client infrastructure
│   ├── config/     # Configuration management system
│   ├── landscape/  # Landscape/environment detection
│   ├── module/     # Module system infrastructure
│   ├── monads/     # Functional monads (Option, Result, discriminated unions)
│   ├── observability/ # Faro integration and error reporting
│   └── problem/    # Problem Details (RFC 7807) error handling system
├── config/         # Configuration schemas and settings
│   ├── client/     # Client-side configuration
│   ├── server/     # Server-side configuration
│   └── common/     # Shared configuration with landscape-specific files
├── problems/       # Problem definition registry
│   └── definitions/ # Specific problem types (validation, auth, etc.)
├── contexts/       # React contexts (ErrorContext)
├── hooks/          # Custom hooks (useUrlState for URL synchronization)
├── styles/         # Global CSS (Tailwind)
└── types/          # TypeScript definitions
```

## Development Commands

**Primary task runner**: `pls` (Task file-based commands)

```bash
# Development
pls dev           # Start Next.js dev server
pls preview       # Build + run with Cloudflare Workers runtime

# Code Quality (REQUIRED before changes)
pls lint          # Run pre-commit hooks (biome, TypeScript, formatting)

# Build & Deploy
pls build         # Build with OpenNext for Cloudflare
pls deploy <env>  # Deploy to landscape (lapras, pichu, pikachu, raichu)
pls upload <env>  # Upload to landscape without full deploy

# SDK Generation
pls generate:sdk        # Generate all SDK clients from OpenAPI specs
pls generate:sdk:zinc   # Generate Zinc service SDK specifically

# Available tasks
pls --list        # Show all available commands
```

## Core System: URL State Management

The codebase has a sophisticated URL synchronization system in `src/hooks/useUrlState.ts`:

**Basic URL state sync**:

```typescript
import { useUrlState } from '@/hooks/useUrlState';
const [query, setQuery] = useUrlState('q', '');
```

**Search with smart loading states**:

```typescript
import { useSearchState } from '@/hooks/useUrlState';
const { query, setQuery, clearSearch, isSearching } = useSearchState(
  'q',
  '',
  async query => {
    /* search logic */
  },
  { loadingDelay: 300 },
);
```

**Key benefits**: Automatic URL sync, browser navigation support, SSR-safe, smart loading states

## Functional Monads (`src/lib/core/`)

**CRITICAL**: All internal project code MUST use functional monads (Option/Result). Never use native errors, null, or undefined.

### Core Types & Boundary Conversion

```typescript
import { Some, None, Opt, Ok, Err, Res } from '@/lib/monads/option';
import { Result } from '@/lib/monads/result';

// REQUIRED: Convert external APIs to monads at boundaries
const safeUser = Opt.fromNative(externalApi.getUser()); // null/undefined → None
const safeResult = await tryFetch().then(Ok).catch(Err); // Promise<T> → Result<T, Error>

// Chain operations safely
const userName = await user
  .map(u => u.name.toUpperCase())
  .andThen(validateName)
  .unwrapOr('Unknown');
```

### Essential Patterns

- **Option<T>**: `Some<T>` | `None` (replaces null/undefined)
- **Result<T,E>**: `Ok<T>` | `Err<E>` (replaces try/catch)
- **Collections**: `Opt.all()`, `Res.all()` for multiple operations
- **Serialization**: `.serial()` for network transfer, `Res.fromSerial()` for deserialization

**Always wrap external code interfaces with these monads before use in internal logic.**

## Configuration Management (`src/lib/config/` & `src/config/`)

Centralized configuration system with validation and environment-specific settings:

**Usage**:

```typescript
import { useConfig } from '@/lib/config';

// In React components
const { clientConfig } = useConfig();

// In API routes
import { getServerConfig } from '@/lib/config';
const serverConfig = await getServerConfig();
```

**Configuration Files**:

- `src/config/client/` - Client-side configuration (browser)
- `src/config/server/` - Server-side configuration (API routes)
- `src/config/common/` - Shared configuration
- Environment-specific: `*.lapras.settings.yaml`, `*.pichu.settings.yaml`, etc.

## Problem Details System (`src/lib/problem/` & `src/problems/`)

RFC 7807 compliant error handling with standardized API responses:

**Usage**:

```typescript
import { ValidationError, EntityConflict, Unauthorized } from '@/problems';

// In API routes
export default function handler(req, res) {
  if (!isValid(req.body)) {
    return ValidationError.send(res, { field: 'email', message: 'Invalid format' });
  }

  if (userExists) {
    return EntityConflict.send(res, { entity: 'User', id: req.body.email });
  }
}
```

**Benefits**: Consistent error responses, client-side error handling, automatic problem detail URLs

## Lottie Animation System

Comprehensive animation framework with fallback support:

**Immediate usage (with CSS fallbacks)**:

```typescript
import { LoadingLottie, SuccessLottie, ErrorLottie, EmptyStateLottie } from '@/components/lottie';
<LoadingLottie size={32} />  // Works immediately with CSS spinner fallback
```

**Inline animations (zero loading state)**:

```typescript
import { InlineLottie } from '@/components/lottie';
import animationData from '/public/animations/loading.json';
<InlineLottie animationData={animationData} width={48} height={48} />
```

**Dynamic loading**:

```typescript
import { LottieAnimation } from '@/components/lottie';
<LottieAnimation animationName="loading" width={48} height={48} />
```

Animation files located in `/public/animations/` (JSON files < 100KB recommended)

## Code Quality & Linting

**Biome configuration** (`biome.json`):

- Linting: All recommended rules + accessibility, performance, security
- Formatting: Auto-organized imports, template literals preferred
- Warnings: Excessive cognitive complexity, console.log usage, array index keys

**TypeScript**:

- Strict mode enabled
- Path mapping: `@/` → `src/`
- Type checking: `tsc --noEmit` (included in `pls lint`)

**Critical**: Always run `pls lint` before making changes to prevent CI failures

## SSR & API Patterns

**Server-side rendering**:

```typescript
export async function getServerSideProps(context) {
  return { props: { data: await fetchData() } };
}
```

**API routes** (in `src/pages/api/`):

```typescript
export default function handler(req, res) {
  res.status(200).json({ data: result });
}
```

## Cloudflare Integration

- **Build**: OpenNext adapter for Workers compatibility
- **Caching**: Headers configured in `public/_headers`
- **Environment**: Wrangler config in `wrangler.toml`
- **Bindings**: Available via `getCloudflareContext()` in production

## Development Workflow

1. **Environment**: Auto-loaded via `direnv` or `nix develop`
2. **Code changes**: Follow existing patterns (shadcn/ui components, custom hooks)
3. **Lint**: `pls lint` (CRITICAL - prevents CI failures)
4. **Test locally**: `pls preview` for Workers runtime testing
5. **Deploy**: `pls deploy <landscape>` when ready

## Observability with Grafana Faro

Grafana Faro Web SDK with distributed tracing is integrated for comprehensive observability, RUM monitoring, and full-stack trace correlation.

### FaroProvider Integration

**Setup**: FaroProvider wraps the entire application and consumes configuration via `useClientConfig()`:

```typescript
// Automatic integration in _app.tsx
<ConfigProvider schemas={configSchemas}>
  <FaroProvider>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </FaroProvider>
</ConfigProvider>
```

**Configuration**: Landscape-specific settings via 4-tier configuration system:

```typescript
import { useClientConfig } from '@/lib/config/providers/hooks';
import type { ClientConfig } from '@/config/client/schema';

const config = useClientConfig<ClientConfig>();
// config.faro.enabled, config.faro.collectorurl, config.faro.envkey, config.faro.debug
```

### SSR Considerations

FaroProvider handles SSR compatibility automatically:

- **Client-side only**: Faro initialization only occurs in browser environment
- **Cloudflare Workers**: Compatible with OpenNext adapter and Workers runtime
- **Hydration safe**: No SSR/hydration mismatches

### Monad-Wrapped Observability

**All Faro operations follow project conventions using Result monads**:

```typescript
import { useFaro } from '@/lib/observability';

const { faro, isLoading } = useFaro();

// Custom logging with error handling
const logResult = await faro?.match({
  ok: faroInstance => {
    faroInstance.api.pushLog(['User action'], { level: 'info' });
    return Ok('Logged successfully');
  },
  err: error => {
    console.log('Faro unavailable, using fallback');
    return Err(error);
  },
});
```

### Distributed Tracing Features

- **Automatic trace context propagation**: traceparent headers added to all HTTP requests
- **Backend integration**: Enable end-to-end observability across frontend and backend services
- **Custom spans**: Create business logic traces using `faro.api.getOTEL()?.trace.getTracer()`
- **Next.js router instrumentation**: Automatic page view tracking and navigation spans
- **OpenTelemetry compatibility**: Works with Grafana Tempo, Jaeger, and other tracing backends

### Usage Patterns

**Custom events and logging**:

```typescript
// Business metrics
faro?.match({
  ok: f => f.api.pushEvent('button_click', { button: 'purchase', section: 'product' }),
  err: () => {}, // Graceful degradation
});

// Error tracking with trace correlation
faro?.match({
  ok: f => f.api.pushError(error, { context: { userId, action: 'checkout' } }),
  err: () => console.error('Manual error log:', error),
});
```

**See `docs/developer/Faro.md` for comprehensive usage examples including custom spans, performance tracking, user context, and backend integration patterns.**

## Dependency Injection System (`src/adapters/`)

Unified provider system that orchestrates all application services, configuration, error handling, and observability:

### AtomiProvider

Root dependency injection container - single setup required:

```typescript
// In _app.tsx
import { AtomiProvider } from '@/adapters/atomi/Provider';

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

### Available Services

```typescript
// Configuration access
import { useConfig } from '@/lib/config';
const { clientConfig, serverConfig } = useConfig();

// Error reporting
import { useProblemReporter } from '@/adapters/problem-reporter/providers';
const problemReporter = useProblemReporter();

// API clients
import { useApiClient } from '@/lib/api/providers';
const apiClient = useApiClient();

// Error context
import { useErrorContext } from '@/contexts/ErrorContext';
const { setError, clearError } = useErrorContext();
```

## Content Manager System

State management for loading, content, and error states across the entire application:

### Error State Management

```typescript
import { useErrorContext } from '@/contexts/ErrorContext';

function MyComponent() {
  const { setError } = useErrorContext();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      setError({
        type: 'user_action_failed',
        title: 'Action Failed',
        status: 400,
        detail: 'The requested action could not be completed.',
      });
    }
  };
}
```

### Page-Level Error Handling

```typescript
// In getServerSideProps
export async function getServerSideProps(context) {
  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    return {
      props: {
        __error: {
          type: 'data_fetch_failed',
          title: 'Data Loading Failed',
          status: 500,
          detail: error.message,
        },
      },
    };
  }
}
```

## Enhanced Error Page System

Error page with status-specific animations, JSON export, and refresh functionality:

### Features

- Status-specific Lottie animations (400, 401, 403, 404, 500, etc.)
- JSON error details export for support
- Refresh functionality with error recovery
- Copy to clipboard functionality

### Usage

```typescript
import { ErrorPage } from '@/components/error-page';

// Automatic integration via AtomiProvider - no setup required
// Manual usage:
<ErrorPage
  error={{
    type: 'validation_error',
    title: 'Invalid Input',
    status: 400,
    detail: 'Please check your input and try again.'
  }}
  onRefresh={() => window.location.reload()}
/>
```

## Problem Reporter System

Error reporting system with Grafana Faro integration:

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

### Error with Context

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
  },
});
```

## Landscape System (`src/lib/landscape/`)

Environment detection and landscape-specific configuration:

### Usage

```typescript
import { useLandscape } from '@/lib/landscape/providers';

function MyComponent() {
  const landscape = useLandscape();
  // landscape: 'lapras' | 'pichu' | 'pikachu' | 'raichu'

  const isProduction = landscape === 'raichu';
  const isDevelopment = landscape === 'pichu';
}
```

## API Client System (`src/lib/api/`)

Unified API client infrastructure with automatic error handling:

### Usage

```typescript
import { useApiClient } from '@/lib/api/providers';

function MyComponent() {
  const apiClient = useApiClient();

  const fetchData = async () => {
    const result = await apiClient.get('/users');
    // Automatic error handling and problem reporting
    return result;
  };
}
```

## Module System (`src/lib/module/`)

Module identification and metadata system:

### Usage

```typescript
import { useModule } from '@/lib/module/providers';

function MyComponent() {
  const module = useModule();
  // Current module: 'webapp'
}
```

## File Naming & Import Conventions

- `.tsx` → React components
- `.ts` → TypeScript utilities
- `@/` → Absolute imports from `src/`
- `/public/` → Static assets
- Relative imports for local files

## 🗺️ AtomiCloud Service Tree

### Service Tree Hierarchy (LPSM)

AtomiCloud uses a hierarchical service tree structure: **Landscape → Platform → Service → Module**

- **Landscape**: Environment tier using pokemon names (lapras=local, pichu=dev, pikachu=staging, raichu=prod)
- **Platform**: Business domain, using functional groups (alcohol, hydrogen, etc.)
- **Service**: Application using elements (argon, helium, etc.)
- **Module**: Component using custom names (webapp, api, worker, etc.)

**Current Project**: Platform=alcohol, Service=argon, Module=webapp, Landscape=varies by deployment

## SDK Integration

Generated TypeScript clients for external services:

**Generated Clients**:

- `src/clients/zinc/generated/zinc-api.ts` - Zinc service API client

**Regeneration**: Run `pls generate:sdk` when APIs change or `pls generate:sdk:zinc` for specific services

## Key Files for Reference

- `LLM.MD` - Detailed technical architecture and conditional usage patterns
- `README.md` - Project overview and setup instructions
- `Taskfile.yaml` - All available `pls` commands
- `package.json` - Dependencies (build: `next build`, type-check: `tsc --noEmit`)
- `biome.json` - Linting and formatting rules
- `wrangler.toml` - Cloudflare Workers configuration
- `open-next.config.ts` - OpenNext adapter configuration
