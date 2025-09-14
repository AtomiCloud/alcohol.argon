# Landscape Library

Environment detection for LPSM architecture using Pokemon-themed names with fallback support and module system integration.

## Architecture

```
landscape/
├── core/
│   ├── core.ts       # Environment source functions
│   └── adapter.ts    # Module adapter
├── next/adapter.ts   # Next.js integration
└── providers/hooks.ts # React hooks
```

## Core Types

```typescript
type LandscapeSource = () => string
type LandscapeName = 'lapras' | 'pichu' | 'pikachu' | 'raichu' | 'base'

interface LandscapeModuleInput {
  source: LandscapeSource
}

function landscapeBuilder(input: LandscapeModuleInput): string
```

## Pokemon Hierarchy

**Environment Mapping**:
- **`lapras`**: Local development (localhost)
- **`pichu`**: Development/testing (shared dev server)
- **`pikachu`**: Staging (pre-production)
- **`raichu`**: Production (live system)
- **`base`**: Fallback/default configuration

**Evolution Chain**: lapras (local) → pichu (dev) → pikachu (staging) → raichu (production)

## Environment Detection

```typescript
const envLandscapeSource: LandscapeSource = () =>
  process.env.LANDSCAPE ||
  process.env.ATOMI_LANDSCAPE ||
  'base'
```

**Variable Priority**:
1. `LANDSCAPE` - Primary environment variable
2. `ATOMI_LANDSCAPE` - Namespaced fallback
3. `'base'` - Default fallback

## Provider System

Module-based landscape provider:

```typescript
const { useContext: useLandscapeContext, Provider: LandscapeProvider } =
  createModuleProvider<LandscapeModuleInput, string>({
    name: 'Landscape',
    builder: input => landscapeBuilder(input)
  })

function useLandscape(): string {
  const { resource } = useLandscapeContext()
  return resource
}
```

## Next.js Integration

Higher-order components for different contexts:

```typescript
const {
  withServerSide: withServerSideLandscape,
  withStatic: withStaticLandscape,
  withApi: withApiLandscape
} = createNextAdapter(module)

// Server-side rendering
export const getServerSideProps = withServerSideLandscape(
  { source: envLandscapeSource },
  async (context, landscape) => ({ props: { landscape } })
)

// API routes
export default withApiLandscape(
  { source: envLandscapeSource },
  async (req, res, landscape) => res.json({ landscape })
)
```
