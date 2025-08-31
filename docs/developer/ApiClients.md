# API Clients

## Using Existing API Clients

### Get API Client

```typescript
import { useApiClient } from '@/lib/api/providers';

function MyComponent() {
  const apiClient = useApiClient();

  // Use client for requests
  const fetchData = async () => {
    const response = await apiClient.get('/users');
    return response.data;
  };
}
```

### Basic Requests

```typescript
const apiClient = useApiClient();

// GET request
const users = await apiClient.get('/users');

// POST request
const newUser = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT request
const updatedUser = await apiClient.put('/users/123', userData);

// DELETE request
await apiClient.delete('/users/123');
```

### With Error Handling

```typescript
import { useApiClient } from '@/lib/api/providers';
import { useProblemReporter } from '@/adapters/problem-reporter/providers';

function MyComponent() {
  const apiClient = useApiClient();
  const problemReporter = useProblemReporter();

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      return Ok(response.data);
    } catch (error) {
      // Automatic error reporting
      problemReporter.pushError(error, {
        source: 'api-client',
        context: { endpoint: '/users', method: 'GET' },
      });
      return Err(error);
    }
  };
}
```

## Generated SDK Clients

### Using Zinc Client

```typescript
import { useZincClient } from '@/clients/alcohol/zinc/api';

function MyComponent() {
  const zincClient = useZincClient();

  const fetchTemplates = async () => {
    const response = await zincClient.getTemplates({
      limit: 10,
      offset: 0,
    });
    return response.data;
  };
}
```

### Type-Safe Requests

```typescript
// Generated clients provide full TypeScript support
const response = await zincClient.createTemplate({
  name: 'My Template',
  description: 'Template description',
  // TypeScript validates all fields
});

// Response is typed
response.data.id; // string
response.data.name; // string
response.data.createdAt; // Date
```

## Adding New API Clients

### 1. Add Configuration

Add API configuration to your config schema:

```typescript
// src/config/client/schema.ts
export const clientConfigSchema = z.object({
  api: z.object({
    baseUrl: z.string().url(),
    timeout: z.number().default(5000),
  }),
  // Add new API
  myApi: z.object({
    baseUrl: z.string().url(),
    apiKey: z.string().optional(),
    timeout: z.number().default(10000),
  }),
});
```

### 2. Update Configuration Files

```yaml
# src/config/client/settings.yaml
api:
  baseUrl: 'http://localhost:3000/api'
  timeout: 5000

myApi:
  baseUrl: 'https://api.myservice.com'
  timeout: 10000
```

```yaml
# src/config/client/lapras.settings.yaml (local)
myApi:
  baseUrl: 'http://localhost:8080'
  apiKey: 'dev-key-123'

# src/config/client/raichu.settings.yaml (prod)
myApi:
  baseUrl: 'https://prod-api.myservice.com'
  # apiKey set via environment variable
```

### 3. Create Client Hook

```typescript
// src/lib/api/providers/my-api-client.ts
import { useClientConfig } from '@/lib/config';

export function useMyApiClient() {
  const config = useClientConfig();

  const client = useMemo(() => {
    return createApiClient({
      baseURL: config.myApi.baseUrl,
      timeout: config.myApi.timeout,
      headers: {
        ...(config.myApi.apiKey && {
          Authorization: `Bearer ${config.myApi.apiKey}`,
        }),
      },
    });
  }, [config.myApi]);

  return client;
}
```

### 4. Export Client

```typescript
// src/lib/api/providers/index.ts
export { useApiClient } from './api-client';
export { useMyApiClient } from './my-api-client';
```

### 5. Use New Client

```typescript
import { useMyApiClient } from '@/lib/api/providers';

function MyComponent() {
  const myApiClient = useMyApiClient();

  const fetchData = async () => {
    const response = await myApiClient.get('/data');
    return response.data;
  };
}
```

## Adding Generated SDK Clients

### 1. Add OpenAPI Spec

Add your OpenAPI specification:

```
src/clients/my-service/
├── openapi.yaml          # OpenAPI specification
└── generated/            # Generated files (auto-created)
    └── my-service-api.ts
```

### 2. Update Generation Script

```typescript
// scripts/generate-sdk.ts
const services = [
  {
    name: 'zinc',
    specPath: 'src/clients/alcohol/zinc/openapi.yaml',
    outputPath: 'src/clients/alcohol/zinc/generated/zinc-api.ts',
  },
  {
    name: 'my-service',
    specPath: 'src/clients/my-service/openapi.yaml',
    outputPath: 'src/clients/my-service/generated/my-service-api.ts',
  },
];
```

### 3. Update Taskfile

```yaml
# Taskfile.yaml
tasks:
  generate:sdk:my-service:
    desc: Generate My Service SDK
    cmds:
      - echo "Generating My Service SDK..."
      - openapi-generator-cli generate -i src/clients/my-service/openapi.yaml -g typescript-fetch -o src/clients/my-service/generated/
```

### 4. Generate Client

```bash
pls generate:sdk:my-service
```

### 5. Create Wrapper Hook

```typescript
// src/clients/my-service/api.ts
import { MyServiceApi, Configuration } from './generated/my-service-api';
import { useClientConfig } from '@/lib/config';

export function useMyServiceClient() {
  const config = useClientConfig();

  const client = useMemo(() => {
    return new MyServiceApi(
      new Configuration({
        basePath: config.myService.baseUrl,
        headers: {
          Authorization: `Bearer ${config.myService.apiKey}`,
        },
      }),
    );
  }, [config.myService]);

  return client;
}
```

### 6. Use Generated Client

```typescript
import { useMyServiceClient } from '@/clients/my-service/api';

function MyComponent() {
  const client = useMyServiceClient();

  const fetchItems = async () => {
    const response = await client.getItems({
      limit: 10,
      filter: 'active',
    });
    return response;
  };
}
```

## Request/Response Interceptors

### Add Request Headers

```typescript
export function useApiClient() {
  const config = useClientConfig();

  const client = useMemo(() => {
    const instance = createApiClient({
      baseURL: config.api.baseUrl,
    });

    // Add request interceptor
    instance.interceptors.request.use(config => {
      config.headers['X-Request-ID'] = generateRequestId();
      config.headers['X-Timestamp'] = Date.now().toString();
      return config;
    });

    return instance;
  }, [config.api]);

  return client;
}
```

### Handle Response Errors

```typescript
export function useApiClient() {
  const problemReporter = useProblemReporter();

  const client = useMemo(() => {
    const instance = createApiClient(config);

    // Add response interceptor
    instance.interceptors.response.use(
      response => response,
      error => {
        // Automatic error reporting
        problemReporter.pushError(error, {
          source: 'api-client',
          context: {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
          },
        });

        throw error;
      },
    );

    return instance;
  }, [problemReporter]);

  return client;
}
```

## Configuration Examples

### Development

```yaml
# lapras.settings.yaml
api:
  baseUrl: 'http://localhost:3000/api'

zinc:
  baseUrl: 'http://localhost:9003'
```

### Production

```yaml
# raichu.settings.yaml
api:
  baseUrl: 'https://api.myapp.com'

zinc:
  baseUrl: 'https://zinc.myapp.com'
```

### Environment Variables

```bash
# Override via environment
ATOMI_CLIENT__API__BASE_URL="https://custom-api.com"
ATOMI_CLIENT__ZINC__API_KEY="prod-key-xyz"
```

## Best Practices

### 1. Use Configuration

```typescript
// ✅ Use configuration system
const config = useClientConfig();
const baseUrl = config.api.baseUrl;

// ❌ Don't hardcode URLs
const baseUrl = 'https://api.myapp.com';
```

### 2. Handle Errors Properly

```typescript
// ✅ Use Result monad pattern
const result = await apiCall().then(Ok).catch(Err);

// ❌ Don't let errors bubble up
const data = await apiCall(); // Throws on error
```

### 3. Use Generated Clients

```typescript
// ✅ Use generated SDK for external services
const client = useZincClient();
const response = await client.getTemplates();

// ❌ Don't create manual API calls for external services
const response = await fetch('https://zinc.com/api/templates');
```

### 4. Report Errors

```typescript
// ✅ Report API errors
try {
  const response = await apiClient.get('/data');
} catch (error) {
  problemReporter.pushError(error, { source: 'api-client' });
  throw error;
}

// ❌ Don't silently swallow errors
try {
  const response = await apiClient.get('/data');
} catch (error) {
  return null; // Lost error information
}
```
