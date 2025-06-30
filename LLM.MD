# LLM Guide

**Always refer to this file before making changes.**

## Project
- **Name**: Alcohol Argon (Next.js SSR with OpenNext on Cloudflare Workers)
- **Framework**: Next.js 15 with Pages Router + Nix-based tooling
- **Platform**: Cloudflare Workers via OpenNext
- **Principles**: Reproducible environments, centralized tasks, comprehensive linting, conventional commits

## Architecture
- **Frontend**: Next.js SSR with Pages Router at root level
- **Runtime**: Cloudflare Workers via OpenNext
- **Styling**: Tailwind CSS + shadcn/ui
- **Static Assets**: Optimally cached via Cloudflare CDN
- **Environment**: Nix-based development environment

## Tools
- **Core**: `pls`, `sg`, `git`, `bun`, `infisical`, `wrangler`
- **Frontend**: Next.js, OpenNext, shadcn/ui, Tailwind CSS
- **Linting**: `treefmt`, `gitlint`, `shellcheck`, `biome`, ESLint
- **Environment**: `atomiutils`, shells (default/ci/releaser)
- **Source**: `nix/packages.nix`

## Commands
```bash
pls setup     # Initialize repository & install dependencies
pls lint      # Lint all files (REQUIRED before commits)
pls build     # Build Next.js application
pls dev       # Start development server
pls preview   # Preview with Workers runtime
pls deploy    # Deploy to Cloudflare Workers
pls cf-typegen # Generate Cloudflare types
pls --list    # Show available tasks
```

## Structure
- `.github/workflows/` → CI/CD
- `docs/developer/` → Documentation
- `src/` → Next.js source code (Pages Router)
- `public/` → Static assets with caching headers
- `nix/` → Nix configuration
- `scripts/ci/` → CI scripts
- `scripts/local/` → Development scripts
- `open-next.config.ts` → OpenNext configuration
- `wrangler.toml` → Cloudflare Workers config
- `Taskfile.yaml` → Task definitions
- `flake.nix` → Main Nix config
- `atomi_release.yaml` → Release config

## Workflow
1. **Environment** → Auto-loaded via direnv or `nix develop`
2. **Development** → `pls dev` for Next.js dev server
3. **Changes** → Make code changes
4. **Lint** → Run `pls lint` (CRITICAL)
5. **Test** → `pls preview` for Workers runtime testing
6. **Deploy** → `pls deploy` to Cloudflare Workers
7. **Commit** → Use conventional commit format

## Frontend Architecture
- **SSR**: Server-Side Rendering with getServerSideProps
- **Static Assets**: Immutable caching (1 year) for build assets, daily cache for images
- **Edge Runtime**: Cloudflare Workers for global performance
- **Caching**: R2 bucket support for incremental cache
- **UI**: shadcn/ui components with Tailwind CSS

## Linting
- **biome** → JS/TS linting
- **ESLint** → Next.js specific linting
- **TypeScript** → Type checking with tsc --noEmit
- **shellcheck** → Shell validation
- **gitlint** → Commit validation
- **infisical** → Secrets scanning
- **treefmt** → Universal formatting

## Commits
- `feat:` → minor release
- `fix:`, `perf:` → patch release
- `refactor:` → minor release
- `docs:`, `ci:`, `build:`, `config:` → no release
- `BREAKING CHANGE:` or `!` → major release
- `no-release` scope → prevents release

## CI/CD
- **Workflows**: CI, Cache, Release, Merge Gatekeeper
- **Shells**: default (dev), ci (testing), releaser (releases)

## Critical Rules
1. Use `pls` for all tasks (not language-specific runners)
2. Run `pls lint` before committing
3. Use conventional commits
4. All tools via Nix (no global installs)
5. Never use `export const runtime = "edge"` (not supported)
6. Static assets must have proper cache headers in `public/_headers`
7. Follow Next.js Pages Router patterns (no App Router)

## Environment Variables
- `NEXTJS_ENV` → Controls .env file loading (development/production)
- Cloudflare bindings available via `getCloudflareContext()` in production

## Deployment
1. **Authenticate**: `bunx wrangler login`
2. **Deploy**: `pls deploy`
3. **Optional R2**: Configure R2 bucket in `wrangler.toml` for enhanced caching

# LLM Workflow Documentation

## Project Overview
This is a Next.js 15 application with SSR support, deployed on Cloudflare Workers using OpenNext adapter. The project includes a comprehensive search functionality with both server-side and client-side capabilities.

## Architecture

### Core Stack
- **Next.js 15**: React framework with Pages Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library built on Radix UI
- **OpenNext**: Cloudflare Workers adapter
- **Lucide React**: Icon library

### Search Implementation

#### 1. Data Layer (`src/lib/sample-data.ts`)
- Structured search data with interfaces
- In-memory search function with fuzzy matching
- Sample data includes tech tools, frameworks, and libraries
- Supports featured items, tags, categories, logos, and images

#### 2. API Layer (`src/pages/api/search.ts`)
- RESTful search endpoint
- Query parameter validation
- Error handling with fallbacks
- Simulated processing delay for realistic UX

#### 3. UI Components
- **Input Component** (`src/components/ui/input.tsx`): Styled input with focus states
- **Badge Component** (`src/components/ui/badge.tsx`): Tags and categories
- **SearchResults Component** (`src/components/SearchResults.tsx`): 
  - Results grid with responsive layout
  - Loading skeleton states
  - Empty state handling
  - Featured item highlighting

#### 4. Search Page (`src/pages/search.tsx`)
- **SSR Implementation**: Initial results rendered server-side
- **Live Search**: Debounced real-time search (300ms)
- **URL Synchronization**: Query parameters sync with search state
- **Hydration Handling**: Prevents client-server mismatch
- **Error Boundaries**: Graceful API failure handling
- **Debug Information**: Development-only debug panel

## Key Features

### Server-Side Rendering (SSR)
- `getServerSideProps` renders initial search results
- Works with query parameters (`/search?q=react`)
- Full page content available on initial load
- SEO-friendly with proper meta tags

### Live Search Functionality
- Real-time search as user types
- 300ms debounce to prevent excessive API calls
- Updates URL without page reload
- Maintains browser history (back/forward navigation)
- Loading states during search
- Fallback to client-side search if API fails

### Dual-Mode Operation
1. **Server-Side** (initial load): Fast first render with search results
2. **Client-Side** (after hydration): Interactive search with API calls

### Asset Management
- Real JPG logos downloaded from web sources
- Optimized JPG preview images for featured items
- Minimal asset footprint (7 logos + 3 preview images)
- All unused SVG files removed for clean deployment
- Optimized asset loading with Next.js Image component

## URL Structure
- `/` - Home page with project overview
- `/search` - Search page (empty state)
- `/search?q=query` - Search with initial query
- `/api/search?q=query&limit=10` - Search API endpoint

## Development Patterns

### State Management
- React hooks for local state
- URL as source of truth for search query
- Hydration tracking to prevent SSR/client mismatches

### Error Handling
- API error boundaries
- Graceful degradation to client-side search
- User-friendly error messages

### Performance Optimizations
- Debounced search to reduce API calls
- Skeleton loading states for perceived performance
- Minimal asset bundle with selective imports

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly interactive elements

## Testing Scenarios
1. Direct URL access: `/search?q=react`
2. Search input typing: Live updates
3. Browser navigation: Back/forward with query preservation
4. API failures: Fallback behavior
5. Empty states: No results handling
6. Loading states: Skeleton animations

## Current Status
✅ Complete search implementation with SSR and live search
✅ Beautiful UI with responsive design and white search bar
✅ URL query parameter handling
✅ Error handling and fallbacks
✅ Real JPG assets downloaded from web (clean minimal footprint)
✅ All unused SVG resources removed
✅ Search data reduced to 7 items with proper assets
✅ All code quality checks passing (ESLint, TypeScript, Biome, treefmt)

## Lottie Animation System

### Setup and Structure
- **Package**: `lottie-react@2.4.1` installed
- **Animations Directory**: `/public/animations/` for all .json files
- **Components**: `/src/components/lottie/` for all Lottie-related components
- **Utilities**: `/src/lib/lottie-utils.ts` for animation helpers
- **Hooks**: `/src/hooks/useLottie.ts` for animation control

### Component Hierarchy
```
src/components/lottie/
├── index.ts              # Main exports
├── LottieAnimation.tsx   # Hybrid component (inline + dynamic loading)
├── InlineLottie.tsx      # Inline-only component (recommended)
├── presets.tsx          # Pre-configured components
├── animations.ts        # Centralized animation imports
├── LottieExample.tsx    # Demo/documentation component
```

### Usage Patterns

#### Inline Animation (Recommended)
```tsx
import loadingData from '/public/animations/loading.json';
import { InlineLottie } from '@/components/lottie';

<InlineLottie 
  animationData={loadingData}
  width={100} 
  height={100} 
  loop={true}
  autoplay={true}
/>
```

#### Dynamic Animation (Fallback)
```tsx
import { LottieAnimation } from '@/components/lottie';

<LottieAnimation 
  animationName="loading" 
  width={100} 
  height={100} 
  showLoader={false}
/>
```

#### Preset Components (Inline by Default)
```tsx
import { LoadingLottie, SuccessLottie } from '@/components/lottie';

<LoadingLottie size={48} />     // Uses inline Lottie animations
<SuccessLottie size={64} />     // Fallback to CSS/SVG until animations added
```

#### Animation Management
- **Presets are inline by default**: No loading states, immediate display
- **LoadingLottie uses simple CSS spinner as fallback**: Works immediately
- **Dynamic animations**: Use consistent spinner loader matching presets
- Built-in error handling and graceful fallbacks
- Responsive sizing utilities and preloading functions available

### File Organization Best Practices
- Common UI animations in `/public/animations/` root
- Custom/feature animations in subdirectories
- Keep file sizes under 100KB when possible
- Use kebab-case naming (e.g., `loading-spinner.json`)

### Integration Points
- Works with existing shadcn/ui components
- Tailwind CSS classes supported
- TypeScript types included
- Next.js SSR compatible

## Development Workflow

### Adding New Animations
1. Download/create .json file from LottieFiles or After Effects
2. Place in `/public/animations/` directory
3. Use with `<LottieAnimation animationName="filename" />`

### Creating Preset Components
1. Add new preset function in `presets.tsx`
2. Export from `index.ts`
3. Document usage in `LottieExample.tsx`

### Performance Considerations
- Animations load asynchronously
- Loading states prevent layout shift
- Preloading functions available for critical animations
- File size guidelines documented

## Technical Decisions

### Why lottie-react
- Official Lottie library for React
- TypeScript support
- Good performance
- Active maintenance

### Directory Structure Choice
- Public directory for static assets (Next.js convention)
- Component directory mirrors other UI components
- Utilities separate for reusability

### Component Design Philosophy
- Fail gracefully with loading/error states
- Props-based customization
- TypeScript-first design
- Composable and reusable 