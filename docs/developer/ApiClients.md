# API Clients

## Overview

API clients in this project are automatically generated from OpenAPI specifications and wrapped to return `Result<T, Problem>` monads instead of throwing exceptions.

## Using Existing API Clients

### Basic Usage

```typescript
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

// In API routes
export default withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  // Access specific client - already configured with base URL
  const result = await apiTree.alcohol.zinc.vUserList({
    version: '1.0',
  });

  return result.match({
    ok: users => ({ props: { users } }),
    err: problem => ({ props: { error: problem } }),
  });
});
```

### Client Structure

```typescript
// The clients are organized by platform and service
// Available through AtomiProvider in server-side contexts
export default withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  // Platform: alcohol, Service: zinc
  const result = await apiTree.alcohol.zinc.vUserList(params);

  // Individual API methods return Result<T, Problem> via built-in transformer
  // apiTree.alcohol.zinc.vUserList(params); // Result<UserPrincipalRes[], Problem>
  // apiTree.alcohol.zinc.vUserCreate(version, data); // Result<UserPrincipalRes, Problem>

  return result.match({
    ok: data => ({ props: { data } }),
    err: problem => ({ props: { error: problem } }),
  });
});
```

## Adding New API Clients

### 1. Add Taskfile Target

Add a new task to your Taskfile.yaml to generate the SDK:

```yaml
# Add this to your Taskfile.yaml tasks section
generate:sdk:myplatform:myservice:
  desc: 'Generate MyPlatform MyService SDK'
  summary: |
    Generate TypeScript SDK client for the MyPlatform MyService.

    Usage: pls generate:sdk:myplatform:myservice -- [SPEC_URL]
  cmds:
    - ./scripts/local/generate-sdk.sh myplatform myservice {{ .CLI_ARGS | default "https://api.myplatform.pichu.cluster.atomi.cloud/swagger/v1/swagger.json" }}
```

Then update the main generate:sdk task to include your new service:

```yaml
generate:sdk:
  desc: 'Generate SDK clients from OpenAPI specifications'
  summary: |
    Generate TypeScript SDK clients for all configured services.
    Uses swagger-typescript-api to create type-safe API clients.
  cmds:
    - task: generate:sdk:alcohol:zinc
    - task: generate:sdk:myplatform:myservice
```

### 2. Generate the SDK

Run the task to generate the SDK:

```bash
# Generate from the default URL in the task
pls generate:sdk:myplatform:myservice

# Or specify a custom OpenAPI spec URL
pls generate:sdk:myplatform:myservice -- https://api.example.com/swagger.json

# Generate all SDKs
pls generate:sdk
```

This creates:

- `src/clients/myplatform/myservice/api.ts` - Generated TypeScript client
- Properly named API class (e.g., `MyplatformMyserviceApi`)

### 3. Update Configuration Schema

Add your client configuration to `src/config/common/schema.ts`:

```typescript
export const commonSchema = z.object({
  // ... existing config
  clients: z.object({
    alcohol: z.object({
      zinc: z.object({
        url: z.url(),
      }),
    }),
    myplatform: z.object({
      // Add your platform
      myservice: z.object({
        url: z.url(),
      }),
    }),
  }),
});
```

### 4. Add Environment-Specific URLs

Add URLs to each landscape configuration:

```yaml
# src/config/common/lapras.settings.yaml (development)
clients:
  alcohol:
    zinc:
      url: 'http://localhost:9003'
  myplatform:
    myservice:
      url: 'http://localhost:8080'

# src/config/common/raichu.settings.yaml (production)
clients:
  alcohol:
    zinc:
      url: 'https://api.zinc.alcohol.raichu.cluster.atomi.cloud'
  myplatform:
    myservice:
      url: 'https://api.myservice.raichu.cluster.atomi.cloud'
```

### 5. Update the Adapter

Add your client to the clientTree function in `src/adapters/external/core.ts`:

```typescript
import { MyplatformMyserviceApi } from '@/clients/myplatform/myservice/api';

const clientTree = (i: CommonConfig) => ({
  alcohol: {
    zinc: new AlcoholZincApi({
      baseUrl: i.clients.alcohol.zinc.url,
    }),
  },
  myplatform: {
    myservice: new MyplatformMyserviceApi({
      baseUrl: i.clients.myplatform.myservice.url,
    }),
  },
});
```

### 6. Access Your Client

```typescript
// In API routes or server-side contexts
export default withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  // Your new client is automatically available
  const result = await apiTree.myplatform.myservice.getItems({ limit: 10 });

  return result.match({
    ok: items => ({ props: { items } }),
    err: problem => ({ props: { error: problem } }),
  });
});

// In getServerSideProps
export const getServerSideProps = withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  const result = await apiTree.myplatform.myservice.getItems({ limit: 10 });

  return result.match({
    ok: items => ({ props: { items } }),
    err: problem => ({ props: { error: problem } }),
  });
});
```

## Error Handling

All API clients return `Result<T, Problem>` monads through the built-in transformer:

```typescript
export default withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  const result = await apiTree.alcohol.zinc.vUserList(params);

  return result.match({
    ok: users => ({ props: { users } }),
    err: problem => {
      // problem is a full RFC 7807 Problem Details object
      console.log(problem.type); // Problem type URI
      console.log(problem.title); // Human-readable title
      console.log(problem.status); // HTTP status code
      console.log(problem.detail); // Detailed description

      return { props: { error: problem } };
    },
  });
});
```
