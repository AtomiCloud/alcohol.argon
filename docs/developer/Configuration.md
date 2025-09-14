# Configuration System

A hierarchical configuration system with type safety, environment overrides, and automatic build integration.

## Quick Start

### Using Configuration in Components

```typescript
import { useConfig } from '@/lib/config';

function MyComponent() {
  const { common, client } = useConfig();

  return (
    <div>
      <h1>{common.app.name}</h1>
      <p>Landscape: {client.landscape}</p>
      <p>Version: {common.app.build.version}</p>
      <p>Faro Enabled: {client.faro.enabled ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Server-Side Usage

```typescript
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

export const getServerSideProps = withServerSideAtomi(buildTime, async (context, { config, apiTree }) => {
  const { common, client, server } = config;

  // Use configured API clients or external fetch
  const result = await apiTree.alcohol.zinc.vUserList({ version: '1.0' });

  return result.match({
    ok: users => ({
      props: {
        users,
        appName: common.app.name,
        landscape: client.landscape,
      },
    }),
    err: problem => ({
      props: {
        error: problem,
        appName: common.app.name,
      },
    }),
  });
});
```

## Configuration Types

- **Common**: Shared between client and server (app info, service tree, build data)
- **Client**: Browser-safe configuration only (faro settings, landscape info)
- **Server**: Server-only configuration (database URLs, secrets, auth settings)

All types support multiple landscapes (lapras, pichu, pikachu, raichu) with automatic merging and type-safe access through the provider system.

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
const { common, client } = useConfig();

// Build information (common config)
common.app.build.sha; // Git commit hash
common.app.build.version; // Git tag version
common.app.build.time; // Build timestamp

// Service tree (AtomiCloud hierarchy)
common.app.servicetree.landscape; // "pichu", "pikachu", etc.
common.app.servicetree.platform; // "alcohol"
common.app.servicetree.service; // "argon"
common.app.servicetree.module; // "webapp"

// Client-specific data
client.landscape; // Current landscape string
client.faro.enabled; // Faro observability enabled
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
   import stagingClientConfig from './client/staging.settings.yaml';
   import stagingServerConfig from './server/staging.settings.yaml';

   export const importedConfigurations = {
     common: {
       landscapes: {
         staging: stagingCommonConfig, // Add here
         // ...existing landscapes
       },
     },
     client: {
       landscapes: {
         staging: stagingClientConfig,
         // ...existing landscapes
       },
     },
     server: {
       landscapes: {
         staging: stagingServerConfig,
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
// Configuration errors are handled at the provider level
// If config fails to load, the entire application will display an error page
// Use try-catch for additional validation in your components if needed

function MyComponent() {
  try {
    const { common, client } = useConfig();
    // Use config safely - provider ensures it's valid
    return <div>{common.app.name}</div>;
  } catch (error) {
    // This should rarely happen as config is validated at startup
    console.error('Config access error:', error);
    return <div>Configuration error</div>;
  }
}
```

## Best Practices

1. **Use appropriate config types**: Keep sensitive data in server config
2. **Define Zod schemas**: Ensure type safety and validation
3. **Use environment variables**: Override configs for different environments
4. **Test across landscapes**: Verify configurations work in all environments
5. **Document schema changes**: Update schemas when adding new options
