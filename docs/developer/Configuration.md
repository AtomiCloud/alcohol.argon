# Configuration System

A hierarchical configuration system with type safety, environment overrides, and automatic build integration.

## Quick Start

### Using Configuration in Components

```typescript
import { useCommonConfig, useClientConfig } from '@/lib/config';

function MyComponent() {
  const commonConfig = useCommonConfig();
  const clientConfig = useClientConfig();

  return (
    <div>
      <h1>{commonConfig.app.name}</h1>
      <p>API: {clientConfig.api.baseUrl}</p>
      <p>Version: {commonConfig.app.build.version}</p>
    </div>
  );
}
```

### Server-Side Usage

```typescript
import { withServerSideConfig } from '@/lib/config';
import { configSchemas } from '@/config';

export const getServerSideProps = withServerSideConfig(configSchemas, async (context, config) => {
  const { common, client, server } = config;

  const data = await fetch(`${server.database.url}/users`);
  return {
    props: {
      users: await data.json(),
      appName: common.app.name,
    },
  };
});
```

## Configuration Types

- **Common**: Shared between client and server
- **Client**: Browser-safe configuration only
- **Server**: Server-only configuration (never sent to client)

All types support multiple landscapes (lapras, pichu, pikachu, raichu) with automatic merging and type-safe access.

## 4-Tier Override System

Configurations merge in priority order (lowest to highest):

1. **Base Configuration** - Default `settings.yaml` files
2. **Landscape Configuration** - Environment-specific files (e.g., `pichu.settings.yaml`)
3. **Runtime Environment Variables** - `ATOMI_` prefixed variables
4. **Build-Time Variables** - Automatically injected build and service data

### Example Override Flow

```yaml
# settings.yaml (base)
app:
  name: 'Alcohol Argon'
  debug: false
```

```yaml
# pichu.settings.yaml (landscape)
app:
  debug: true
```

```bash
# Environment variables (runtime)
ATOMI_COMMON__APP__NAME="My Custom App"
```

**Final result:**

```typescript
{
  app: {
    name: "My Custom App",           // Environment variable (highest priority)
    debug: true,                     // Landscape setting
    build: {
      sha: "abc1234",               // Auto-injected
      version: "1.2.3",            // Auto-injected
      time: 1642781234000           // Auto-injected
    },
    servicetree: {
      landscape: "pichu",           // Auto-injected
      platform: "alcohol",         // Auto-injected
      service: "argon",             // Auto-injected
      module: "webapp"              // Auto-injected
    }
  }
}
```

## Environment Variable Overrides

Override any configuration using `ATOMI_` prefixed environment variables:

### Basic Format

```bash
ATOMI_<CONFIG_TYPE>__<NESTED_KEY>__<VALUE>
```

### Examples

```bash
# Common config
ATOMI_COMMON__APP__NAME="Custom App"
ATOMI_COMMON__APP__DEBUG=true

# Client config
ATOMI_CLIENT__API__BASE_URL="https://api.example.com"
ATOMI_CLIENT__API__TIMEOUT=10000

# Server config
ATOMI_SERVER__DATABASE__URL="postgresql://localhost/myapp"

# Nested objects (use double underscores)
ATOMI_CLIENT__API__AUTH__TOKEN="new-token"
```

### Arrays

```bash
# Simple arrays
ATOMI_COMMON__SERVERS__0="https://api1.example.com"
ATOMI_COMMON__SERVERS__1="https://api2.example.com"

# Array of objects
ATOMI_COMMON__USERS__0__NAME="Alice"
ATOMI_COMMON__USERS__0__EMAIL="alice@example.com"
ATOMI_COMMON__USERS__1__NAME="Bob"
ATOMI_COMMON__USERS__1__EMAIL="bob@example.com"

# JSON syntax (alternative)
ATOMI_CLIENT__API__ALLOWED_ORIGINS='["https://example.com", "https://app.com"]'
```

## Build-Time Integration

The system automatically injects build information and service tree data:

### Available Build Data

```typescript
const config = useCommonConfig();

// Build information
config.app.build.sha; // Git commit hash
config.app.build.version; // Git tag version
config.app.build.time; // Build timestamp

// Service tree (AtomiCloud hierarchy)
config.app.servicetree.landscape; // "pichu", "pikachu", etc.
config.app.servicetree.platform; // "alcohol"
config.app.servicetree.service; // "argon"
config.app.servicetree.module; // "webapp"
```

This data is automatically available in all environments without manual configuration.

## Adding New Landscapes

1. **Create YAML files:**

   ```
   src/config/common/staging.settings.yaml
   src/config/client/staging.settings.yaml
   src/config/server/staging.settings.yaml  # optional
   ```

2. **Update configs.ts:**

   ```typescript
   import stagingCommonConfig from './common/staging.settings.yaml';

   export const importedConfigurations = {
     common: {
       landscapes: {
         staging: stagingCommonConfig, // Add here
         // ...existing landscapes
       },
     },
   };
   ```

3. **Update wrangler.toml:**
   ```toml
   [env.staging]
   name = "your-app-staging"
   [env.staging.vars]
   LANDSCAPE = "staging"
   ```

## File Structure

```
src/config/
├── common/                    # Shared configurations
│   ├── settings.yaml         # Base config
│   ├── lapras.settings.yaml  # Development
│   ├── pichu.settings.yaml   # Staging
│   ├── pikachu.settings.yaml # Pre-production
│   └── raichu.settings.yaml  # Production
├── client/                   # Browser-safe only
│   ├── settings.yaml
│   └── [landscape].settings.yaml
├── server/                   # Server-only
│   └── settings.yaml
├── [type]/schema.ts          # Zod schemas
├── configs.ts                # Configuration imports
└── index.ts                  # Main exports
```

## Error Handling

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

1. **Use appropriate config types**: Keep sensitive data in server config
2. **Define Zod schemas**: Ensure type safety and validation
3. **Use environment variables**: Override configs for different environments
4. **Test across landscapes**: Verify configurations work in all environments
5. **Document schema changes**: Update schemas when adding new options
