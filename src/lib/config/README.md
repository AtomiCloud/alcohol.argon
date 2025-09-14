# Config Library

Type-safe configuration management with multi-tier hierarchies, landscape-specific overrides, and Zod validation.

## Architecture

```
config/
├── core/
│   ├── registry.ts          # Type-safe config storage
│   ├── loader.ts            # YAML file loading
│   ├── merge.ts             # Multi-tier merging
│   ├── validator.ts         # Zod validation
│   ├── manager.ts           # Configuration orchestration
│   └── build-time.ts        # Build-time processing
├── next/index.ts            # Next.js integration
└── providers/index.ts       # React providers and hooks
```

## Core Types

```typescript
type ConfigSchemas = {
  common: z.ZodSchema;
  client: z.ZodSchema;
  server: z.ZodSchema;
}

class ConfigRegistry<T extends ConfigSchemas> {
  get common(): z.infer<T['common']>
  get client(): z.infer<T['client']>
  get server(): z.infer<T['server']>
}
```

## Configuration Flow

1. **Load**: Import YAML files based on landscape using `ConfigurationLoader`
2. **Merge**: 4-tier hierarchy: base → landscape → build-time env → runtime env
3. **Validate**: Apply Zod schemas via `ConfigurationValidator`
4. **Register**: Store in `ConfigRegistry` for type-safe access
5. **Provide**: Available via React context and hooks

## Environment Processing

`ConfigurationMerger` processes `ATOMI_` prefixed variables:

```typescript
// ATOMI_COMMON__APP__NAME="Custom App"
// becomes: { common: { app: { name: "Custom App" } } }

class ConfigurationMerger {
  merge<T>(base: T, buildTimeEnv: Partial<T>, runtimeEnv: Partial<T>): T
  processEnvVariables(variables: object): Record<string, unknown>
  processBuildTimeEnvironmentVariables(): Record<string, unknown>
}
```

**Variable Types**: Supports strings, numbers, booleans, JSON objects/arrays, and nested array indexing.

## Next.js Integration
## Next.js DefinePlugin Integration

The library integrates with Next.js webpack configuration to inject build-time variables using DefinePlugin. This enables compile-time configuration injection for improved performance and security.

### Build-Time Processing

The `BuildTimeProcessor` class scans environment variables during the build process:

```typescript
// src/lib/config/core/build-time.ts
class BuildTimeProcessor {
  private readonly prefix: string;

  constructor(prefix?: string) {
    this.prefix = prefix || 'ATOMI_';
  }

  scanEnvironmentVariables(env: Record<string, string | undefined> = process.env): Record<string, string> {
    const variables: Record<string, string> = {};

    for (const [key, value] of Object.entries(env)) {
      if (!key.startsWith(this.prefix) || value === undefined) continue;
      variables[key] = value;
    }

    return variables;
  }
}
```

### Next.js Configuration Integration

In `next.config.ts`, the library integrates with webpack's DefinePlugin:

```typescript
// next.config.ts
import { BuildTimeProcessor } from '@/lib/config/core/build-time';

// Process build-time environment variables
const buildTimeProcessor = new BuildTimeProcessor();
const buildTimeEnv = buildTimeProcessor.scanEnvironmentVariables(process.env);

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Inject build-time environment variables into webpack DefinePlugin
    config.plugins = config.plugins || [];
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_TIME_VARIABLES': JSON.stringify(buildTimeEnv),
      }),
    );

    return config;
  },
};
```

### Build-Time Variable Sources

Build-time variables are automatically exported by the CI script:

```bash
# scripts/ci/export_build_info.sh
export ATOMI_COMMON__APP__BUILD__SHA="sha-$(git rev-parse --short HEAD)"
export ATOMI_COMMON__APP__BUILD__VERSION="$(git describe --tags --match 'v*' --abbrev=0)"
export ATOMI_COMMON__APP__BUILD__TIME="$(date +%s)000"
export ATOMI_COMMON__APP__SERVICETREE__LANDSCAPE="$LANDSCAPE"
```

These variables are then:
1. Scanned by `BuildTimeProcessor`
2. Injected into webpack via DefinePlugin
3. Compiled into the application bundle
4. Available at runtime without additional network requests

## React Integration

Module-based provider system with type-safe hooks:

```typescript
const { ConfigProvider, useConfig, useConfigRegistry } = createConfigProvider<T>()

function useConfig() {
  return {
    common: useCommonConfig(),
    client: useClientConfig(),
  }
}
```

## Usage

**Setup**:
```typescript
// Import configurations
const importedConfigurations: ImportedConfigurations = {
  common: { base: baseConfig, landscapes: { pichu: pichuConfig } },
  client: { base: clientConfig, landscapes: { pichu: pichuClientConfig } },
  server: { base: serverConfig, landscapes: { pichu: pichuServerConfig } }
}

// Provide to app
<ConfigProvider input={{ schemas, importedConfigurations, landscape: 'pichu' }}>
  <App />
</ConfigProvider>
```

**Access**:
```typescript
function MyComponent() {
  const { common, client } = useConfig()
  return <div>{common.app.name}</div>
}
```