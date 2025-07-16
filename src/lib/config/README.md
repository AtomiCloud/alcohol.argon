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
4. Merge with base configurations

### Example
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