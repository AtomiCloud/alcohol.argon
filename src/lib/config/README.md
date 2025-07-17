# Configuration Library

This library provides a hierarchical configuration system for Next.js applications with TypeScript and Zod validation.

## Architecture

The configuration system consists of several core components:

### Core Components

- **Registry** (`core/registry.ts`): Global configuration storage and type-safe access
- **Loader** (`core/loader.ts`): Loads configurations from user-imported YAML files
- **Merger** (`core/merge.ts`): Merges base → landscape → environment variables
- **Validator** (`core/validator.ts`): Zod-based validation with detailed error messages

### Integration Components

- **React Provider** (`providers/ConfigProvider.tsx`): React context for configuration access
- **React Hooks** (`providers/hooks.ts`): Type-safe hooks for accessing configurations
- **Next.js SSR** (`next/withServerSideConfig.ts`): Server-side rendering integration
- **Next.js SSG** (`next/withStaticConfig.ts`): Static site generation integration

## Usage by Applications

### 1. Define Configuration Schemas

Applications must define Zod schemas for each configuration type:

```typescript
// src/config/common/schema.ts
import { z } from 'zod';

export const commonSchema = z.object({
  app: z.object({
    name: z.string(),
    debug: z.boolean().default(false),
  }),
});

export type CommonConfig = z.infer<typeof commonSchema>;
```

### 2. Import YAML Configurations

Applications import all YAML files directly:

```typescript
// src/config/configs.ts
import type { ImportedConfigurations } from '@/lib/config/core/loader';

import baseCommonConfig from './common/settings.yaml';
import laprasCommonConfig from './common/lapras.settings.yaml';

export const importedConfigurations: ImportedConfigurations = {
  common: {
    base: baseCommonConfig,
    landscapes: {
      lapras: laprasCommonConfig,
      // ... other landscapes
    },
  },
  // ... client and server configurations
};
```

### 3. Initialize Configuration System

The library automatically initializes when used with React Provider:

```typescript
// src/pages/_app.tsx
import { ConfigProvider } from '@/lib/config';
import { configSchemas } from '@/config';

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider schemas={configSchemas}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
```

## Core Library API

### Configuration Loading

```typescript
import { loadConfigurations } from '@/lib/config/core/loader';

const rawConfigs = loadConfigurations(importedConfigurations);
// Returns: { common: unknown, client: unknown, server: unknown }
```

### Configuration Merging

```typescript
import { mergeConfigurations, processEnvironmentVariables } from '@/lib/config/core/merge';

const envOverrides = processEnvironmentVariables();
const mergedConfig = mergeConfigurations(baseConfig, landscapeConfig, envOverrides);
```

### Configuration Validation

```typescript
import { validateAllConfigurations } from '@/lib/config/core/validator';

const validatedConfigs = validateAllConfigurations(mergedConfigs, schemas);
```

### Registry Management

```typescript
import { registerSchemas, getValidatedConfig } from '@/lib/config/core/registry';

registerSchemas(schemas, validatedConfigs);
const config = getValidatedConfig('common'); // Type-safe access
```

## Environment Variable Processing

The library automatically processes environment variables with the `ATOMI_` prefix:

### Format
```
ATOMI_<CONFIG_TYPE>__<NESTED_KEY>__<VALUE>
```

### Processing Logic
1. Split by double underscores (`__`)
2. Convert to nested object structure
3. Parse JSON values for arrays/objects
4. Support array indexing with numeric keys
5. Merge with base configurations

### Object Examples
```bash
ATOMI_COMMON__APP__NAME="Custom App"
```
Becomes:
```typescript
{
  common: {
    app: {
      name: "Custom App"
    }
  }
}
```

### Array Examples
```bash
ATOMI_COMMON__SERVERS__0="https://api1.example.com"
ATOMI_COMMON__SERVERS__1="https://api2.example.com"
ATOMI_COMMON__SERVERS__2="https://api3.example.com"
```
Becomes:
```typescript
{
  common: {
    servers: [
      "https://api1.example.com",
      "https://api2.example.com", 
      "https://api3.example.com"
    ]
  }
}
```

### Nested Array Examples
```bash
ATOMI_COMMON__USERS__0__NAME="Alice"
ATOMI_COMMON__USERS__0__EMAIL="alice@example.com"
ATOMI_COMMON__USERS__1__NAME="Bob"
ATOMI_COMMON__USERS__1__EMAIL="bob@example.com"
```
Becomes:
```typescript
{
  common: {
    users: [
      {
        name: "Alice",
        email: "alice@example.com"
      },
      {
        name: "Bob", 
        email: "bob@example.com"
      }
    ]
  }
}
```

## Configuration Flow

1. **Load**: Import YAML files based on landscape
2. **Merge**: base → landscape → environment variables
3. **Validate**: Apply Zod schemas with detailed error messages
4. **Register**: Store in global registry for type-safe access
5. **Provide**: Make available via React context and hooks

## Error Handling

The library provides structured error handling:

```typescript
import { isConfigValidationError, getValidationErrorMessage } from '@/lib/config/core/validator';

try {
  validateConfiguration(config, schema);
} catch (error) {
  if (isConfigValidationError(error)) {
    const message = getValidationErrorMessage(error);
    // Handle validation error
  }
}
```

## Type Safety

The library ensures end-to-end type safety:

1. **Schema Definition**: Zod schemas define structure and validation
2. **Type Inference**: TypeScript types inferred from schemas
3. **Registry Mapping**: Generic types ensure correct config type access
4. **Hook Types**: React hooks return properly typed configurations

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

### Configuration Manager Updates

The `ConfigurationFactory` now creates managers without the deprecated `createDefaultManager` method:

```typescript
// Updated factory usage in Next.js integrations
export function withServerSideConfig<T extends ConfigSchemas, P = Record<string, unknown>>(
  schemas: T,
  handler: ConfigHandler<T, GetServerSidePropsContext, GetServerSidePropsResult<P>>
): GetServerSideProps<P> {
  return async (context: GetServerSidePropsContext) => {
    try {
      // Create configuration manager using the factory
      const configManager = ConfigurationFactory.createManager<T>();
      const configRegistry = configManager.createRegistry(schemas, importedConfigurations);

      // Call the user's handler with the config registry
      return await handler(context, configRegistry);
    } catch (error) {
      // Error handling...
    }
  };
}
```

### Performance Benefits

1. **Compile-Time Injection**: Build variables are compiled into the bundle, eliminating runtime processing
2. **Zero Runtime Overhead**: No need to parse environment variables at runtime
3. **Tree Shaking**: Unused configuration branches can be eliminated during bundling
4. **Type Safety**: Full TypeScript support for build-time variables

### Security Benefits

1. **No Environment Exposure**: Build-time variables don't expose server environment to client
2. **Selective Injection**: Only explicitly processed variables are included
3. **Immutable Values**: Build-time values cannot be modified at runtime


### Server-Side Rendering

```typescript
export const getServerSideProps = withServerSideConfig(
  schemas,
  async (context, config) => {
    // config is fully typed based on schemas
    return { props: { data: config.common.app.name } };
  }
);
```

### Static Site Generation

```typescript
export const getStaticProps = withStaticConfig(
  schemas,
  async (context, config) => {
    // Same typed access as SSR
    return { props: { buildTime: Date.now() } };
  }
);
```

## Extension Points

### Adding New Configuration Types

1. Extend `ConfigSchemas` interface
2. Update `ImportedConfigurations` interface
3. Add validation logic in validator
4. Create corresponding hooks

### Custom Environment Processing

Override `processEnvironmentVariables` for custom logic:

```typescript
import { processEnvironmentVariables } from '@/lib/config/core/merge';

const customEnvVars = processEnvironmentVariables('CUSTOM_PREFIX_');
```

## Testing

The library supports testing with mock configurations:

```typescript
import { registerSchemas } from '@/lib/config/core/registry';

// In tests
registerSchemas(testSchemas, mockConfigurations);
```

## Performance Considerations

- **Build-time Loading**: All YAML files loaded at build time
- **Synchronous Access**: No runtime async operations
- **Memory Efficient**: Single registry instance
- **Type-safe**: Zero runtime type checking overhead

## Migration Guide

### From Path-based System

1. Replace `ConfigurationPaths` with `ImportedConfigurations`
2. Import YAML files directly instead of providing paths
3. Update library imports to use new interfaces

### From Dynamic Loading

1. Move from `await loadConfigurations()` to `loadConfigurations()`
2. Import all configurations at module level
3. Remove dynamic import logic