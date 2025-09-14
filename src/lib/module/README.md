# Module Library

Generic dependency injection system for React and Next.js with type-safe module composition, lazy initialization, and unified APIs across SSR/SSG/client contexts.

## Architecture

```
module/
├── core/index.ts         # Core module types
├── providers/provider.tsx # React context provider factory
└── next/
    ├── next.ts          # Next.js adapter implementation
    └── types.ts         # Handler type definitions
```

## Core Types

```typescript
interface Module<TInput, TOutput> {
  name: string
  builder: ModuleBuilder<TInput, TOutput>
}

type ModuleBuilder<TInput, TOutput> = (input: TInput) => TOutput | Promise<TOutput>

interface ModuleContext<TOutput> {
  isLoading: boolean
  error: string | null
  resource: TOutput
}
```

## Provider System

```typescript
function createModuleProvider<TInput, TOutput>(config: ProviderConfig<TInput, TOutput>) {
  return {
    Provider: ModuleProvider,
    useContext: useModuleContext
  }
}
```

**Features**: Lazy initialization, dependency tracking, built-in error boundaries, automatic loading states

## Next.js Integration

```typescript
function createNextAdapter<TInput, TOutput>(config: NextAdapterConfig<TInput, TOutput>) {
  return {
    withApi: WithApiHandler<TInput, TOutput>,       // API routes
    withServerSide: WithServerSideHandler<TInput, TOutput>, // SSR
    withStatic: WithStaticHandler<TInput, TOutput>  // SSG
  }
}
```

## Usage Patterns

### Basic Module Definition

Creating a simple module with type safety:

```typescript
// Define module input and output types
interface DatabaseConfig {
  connectionString: string
  poolSize: number
}

interface DatabaseClient {
  query: (sql: string) => Promise<any[]>
  close: () => Promise<void>
}

// Create module builder
const databaseBuilder: ModuleBuilder<DatabaseConfig, DatabaseClient> = async (config) => {
  const connection = await createConnection(config.connectionString)
  return {
    query: (sql) => connection.query(sql),
    close: () => connection.close()
  }
}

// Define module
const databaseModule: Module<DatabaseConfig, DatabaseClient> = {
  name: 'Database',
  builder: databaseBuilder
}
```

### React Provider Usage

Setting up module providers in React applications:

```typescript
// Create provider factory
const { Provider: DatabaseProvider, useContext: useDatabaseContext } =
  createModuleProvider(databaseModule)

// Application setup
function App() {
  const databaseConfig: DatabaseConfig = {
    connectionString: process.env.DATABASE_URL!,
    poolSize: 10
  }

  return (
    <DatabaseProvider config={databaseConfig}>
      <UserList />
    </DatabaseProvider>
  )
}

// Component usage
function UserList() {
  const { resource: db, isLoading, error } = useDatabaseContext()

  if (isLoading) return <div>Connecting to database...</div>
  if (error) return <div>Database error: {error}</div>

  const [users, setUsers] = useState([])

  useEffect(() => {
    db.query('SELECT * FROM users').then(setUsers)
  }, [db])

  return <ul>{users.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

### Next.js API Route Usage

Integrating modules into API routes:

```typescript
// Create adapter
const { withApi } = createNextAdapter(databaseModule)

// API route with module injection
export default withApi(
  {
    connectionString: process.env.DATABASE_URL!,
    poolSize: 5
  },
  async (req, res, db) => {
    // db is the built DatabaseClient
    const users = await db.query('SELECT * FROM users')
    res.json({ users })
  }
)
```

### Server-Side Rendering Usage

Module injection in SSR contexts:

```typescript
const { withServerSide } = createNextAdapter(databaseModule)

export const getServerSideProps = withServerSide(
  {
    connectionString: process.env.DATABASE_URL!,
    poolSize: 10
  },
  async (context, db) => {
    // db is available in SSR context
    const users = await db.query('SELECT * FROM users WHERE active = 1')

    return {
      props: {
        users: JSON.parse(JSON.stringify(users))  // Serialize for client
      }
    }
  }
)
```

### Static Site Generation Usage

Build-time module usage:

```typescript
const { withStatic } = createNextAdapter(configModule)

export const getStaticProps = withStatic(
  {
    environment: 'production',
    region: 'us-east-1'
  },
  async (context, config) => {
    // config built at build time
    const staticData = await generateStaticContent(config)

    return {
      props: { staticData },
      revalidate: 3600  // Rebuild every hour
    }
  }
)
```