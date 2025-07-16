# Configuration System

This guide explains how to use the hierarchical configuration system in your application.

## Overview

The configuration system provides three types of configurations:

- **Common**: Shared between client and server
- **Client**: Browser-safe configuration only
- **Server**: Server-only configuration (never sent to client)

All configurations support:

- Multiple landscapes (lapras, pichu, pikachu, raichu)
- Environment variable overrides
- Type-safe access with Zod validation
- Automatic merging (base → landscape → environment variables)

## Using Configuration in Components

### React Components

```typescript
import { useCommonConfig, useClientConfig } from '@/lib/config';

function MyComponent() {
  const commonConfig = useCommonConfig();
  const clientConfig = useClientConfig();

  return (
    <div>
      <h1>{commonConfig.app.name}</h1>
      <p>API: {clientConfig.api.baseUrl}</p>
    </div>
  );
}
```

### Server-Side Rendering (SSR)

```typescript
import { withServerSideConfig } from '@/lib/config';
import { configSchemas } from '@/config';

export const getServerSideProps = withServerSideConfig(configSchemas, async (context, config) => {
  // Access all three configuration types
  const { common, client, server } = config;

  // Use server config for API calls
  const data = await fetch(`${server.database.url}/users`);

  return {
    props: {
      users: await data.json(),
      appName: common.app.name,
    },
  };
});
```

### Static Site Generation (SSG)

```typescript
import { withStaticConfig } from '@/lib/config';
import { configSchemas } from '@/config';

export const getStaticProps = withStaticConfig(configSchemas, async (context, config) => {
  const { common, client, server } = config;

  return {
    props: {
      buildTime: new Date().toISOString(),
      appName: common.app.name,
    },
  };
});
```

## Environment Variable Overrides

You can override any configuration value using environment variables with the `ATOMI_` prefix:

### Format

```bash
ATOMI_<CONFIG_TYPE>__<NESTED_KEY>__<VALUE>
```

### Examples

```bash
# Override common config
ATOMI_COMMON__APP__NAME="My Custom App Name"
ATOMI_COMMON__APP__DEBUG=true

# Override client config
ATOMI_CLIENT__API__BASE_URL="https://api.example.com"
ATOMI_CLIENT__API__TIMEOUT=10000

# Override server config
ATOMI_SERVER__DATABASE__URL="postgresql://localhost/myapp"
```

### Nested Objects

For deeply nested configurations, use double underscores (`__`):

```bash
# For config structure: { api: { auth: { token: "..." } } }
ATOMI_CLIENT__API__AUTH__TOKEN="new-token-value"
```

### Array Values

Arrays are supported using JSON syntax:

```bash
ATOMI_CLIENT__API__ALLOWED_ORIGINS='["https://example.com", "https://app.com"]'
```

## Adding New Landscapes

To add a new landscape (e.g., `staging`):

1. **Create YAML files**:

   ```
   src/config/common/staging.settings.yaml
   src/config/client/staging.settings.yaml
   src/config/server/staging.settings.yaml  # optional
   ```

2. **Update configs.ts**:

   ```typescript
   // Import the new files
   import stagingCommonConfig from './common/staging.settings.yaml';
   import stagingClientConfig from './client/staging.settings.yaml';

   // Add to importedConfigurations
   export const importedConfigurations = {
     common: {
       base: baseCommonConfig,
       landscapes: {
         lapras: laprasCommonConfig,
         staging: stagingCommonConfig, // Add this
         // ...
       },
     },
     // ... repeat for client and server
   };
   ```

3. **Update wrangler.toml**:

   ```toml
   [env.staging]
   name = "your-app-staging"

   [env.staging.vars]
   LANDSCAPE = "staging"
   ```

## Error Handling

The configuration system provides helpful error messages:

```typescript
import { isConfigValidationError, getValidationErrorMessage } from '@/lib/config';

try {
  const config = useCommonConfig();
} catch (error) {
  if (isConfigValidationError(error)) {
    console.error('Config validation error:', getValidationErrorMessage(error));
  }
}
```

## Best Practices

1. **Use appropriate config types**: Keep sensitive data in server config, browser-safe data in client config
2. **Validate with schemas**: Always define Zod schemas for type safety
3. **Use environment variables**: Override configurations for different environments
4. **Test configurations**: Verify configs work across all landscapes
5. **Document changes**: Update schemas when adding new configuration options

## File Structure

```
src/config/
├── common/                    # Shared configurations
│   ├── settings.yaml         # Base common config
│   ├── lapras.settings.yaml  # Development overrides
│   ├── pichu.settings.yaml   # Staging overrides
│   ├── pikachu.settings.yaml # Pre-prod overrides
│   └── raichu.settings.yaml  # Production overrides
├── client/                   # Browser-safe configurations
│   ├── settings.yaml
│   ├── lapras.settings.yaml
│   ├── pichu.settings.yaml
│   ├── pikachu.settings.yaml
│   └── raichu.settings.yaml
├── server/                   # Server-only configurations
│   └── settings.yaml
├── common/schema.ts          # Common config schema
├── client/schema.ts          # Client config schema
├── server/schema.ts          # Server config schema
├── configs.ts                # Configuration imports
└── index.ts                  # Main exports
```
