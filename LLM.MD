# LLM Guide

**Always refer to this file before making changes.**

## LLM.MD Self-Writing Instructions

When updating this file, optimize for code generation by:

**Content Strategy:**
- Keep essential workflows, remove verbose explanations
- Focus on "how-to" over "what-is" descriptions  
- Add conditional usage patterns ("When to use X")
- Include specific import patterns and component examples

**Structure Guidelines:**
- Use hierarchical sections with emojis for quick scanning
- Group related information under clear headings
- Keep code examples concise but complete
- Eliminate deployment/commit workflows, focus on runtime instructions

**Technical Accuracy:**
- Verify file paths, imports, and tool versions are current
- Test code examples for syntax correctness
- Cross-reference with actual project structure
- Emphasize patterns that improve generated code quality

## Project Overview
- **Name**: Alcohol Argon (Next.js SSR + Cloudflare Workers)
- **Stack**: Next.js 15 Pages Router, TypeScript, Tailwind CSS, shadcn/ui
- **Runtime**: Cloudflare Workers via OpenNext adapter
- **Environment**: Nix-based reproducible development

## Essential Commands
```bash
pls dev       # Development server
pls build     # Build application
pls preview   # Preview with Workers runtime
pls deploy    # Deploy to Cloudflare
pls lint      # Lint all files (REQUIRED before changes)
pls --list    # Show available tasks
```

## Critical Rules
1. **Always use `pls` commands** (not npm/bun/yarn directly)
2. **Run `pls lint` before making changes** (prevents CI failures)
3. **Use custom hooks for performance** (see `src/hooks/` directory)
4. **Avoid runtime edge exports** (use standard Next.js patterns)

## File Structure
```
src/
├── pages/           # Next.js Pages Router
├── components/      # React components
│   ├── ui/         # shadcn/ui components
│   └── lottie/     # Lottie animations
├── lib/            # Utilities and APIs
├── hooks/          # Custom React hooks
├── styles/         # Global CSS
└── types/          # TypeScript types
public/
├── animations/     # Lottie JSON files
├── images/         # Static images
└── _headers        # Cloudflare cache headers
```

## Linting & Formatting
- **biome** → JS/TS linting and formatting
- **TypeScript** → Type checking (`tsc --noEmit`)
- **ESLint** → Next.js specific rules
- **treefmt** → Universal formatting



## Development Workflow
1. **Environment** → Auto-loaded via direnv or `nix develop`
2. **Code Changes** → Make your changes
3. **Lint** → `pls lint` (CRITICAL)
4. **Test** → `pls preview` for Workers testing



## Environment Variables
- `NEXTJS_ENV` → Controls .env loading (development/production)
- Cloudflare bindings available via `getCloudflareContext()` in production

---

## Conditional Usage Guide

### 🔧 When Working with Components
- **shadcn/ui**: Components in `src/components/ui/`
- **Lottie**: Use components from `src/components/lottie/`
- **Styling**: Tailwind CSS classes, responsive design patterns

### 🌐 When Building Pages
- **SSR**: Use `getServerSideProps` for data fetching
- **API Routes**: Place in `src/pages/api/`
- **Static Assets**: Add to `public/` with proper cache headers in `_headers`

### 🎨 When Adding Animations
- **Lottie Files**: Place JSON in `public/animations/`
- **Components**: Use `InlineLottie` for best performance
- **Presets**: Available components: `LoadingLottie`, `SuccessLottie`

### 📦 When Adding Dependencies
- **Add to package.json**: Let Nix handle the environment
- **TypeScript Types**: Install @types packages as devDependencies
- **Build Tools**: Configure in respective config files

### 🚀 When Deploying
- **Authentication**: `bunx wrangler login` (first time)
- **Environment**: Configure in `wrangler.toml`
- **Secrets**: Use Cloudflare dashboard or `wrangler secret`

### 🔍 When Debugging
- **Development**: `pls dev` for hot reload
- **Production**: `pls preview` for Workers runtime
- **Logs**: Use `wrangler tail` for production logs
- **Types**: `pls cf-typegen` to regenerate Cloudflare types

## Custom Hooks for Performance

### URL State Management (`src/hooks/useUrlState.ts`)
Use these hooks for better URL synchronization and search functionality:

```typescript
// Generic URL state synchronization
import { useUrlState } from '@/hooks/useUrlState';
const [query, setQuery] = useUrlState('q', '');

// Search-specific with smart loading states
import { useSearchState } from '@/hooks/useUrlState';
const { query, setQuery, clearSearch, isSearching } = useSearchState(
  'q',
  '',
  async (query) => {
    // Perform search
  },
  { loadingDelay: 300 }
);
```

**Benefits:**
- Automatic URL synchronization without manual debouncing
- Smart loading states (only show spinner for slow responses)
- Browser back/forward navigation support
- SSR-safe initialization
- Single API call per user input (no duplicates)

## Architecture Notes

### Next.js Configuration
- **SSR**: Server-side rendering with `getServerSideProps`
- **Static Generation**: Use `getStaticProps` for static pages
- **API Routes**: Standard Next.js API pattern

### Cloudflare Integration  
- **Workers Runtime**: Via OpenNext adapter
- **Caching**: Configured in `public/_headers`
- **Bindings**: Available in production context
- **R2 Storage**: Optional for enhanced caching

### TypeScript Setup
- **Strict Mode**: Enabled with comprehensive rules
- **Path Mapping**: `@/` points to `src/`
- **Type Checking**: Run `pls lint` includes `tsc --noEmit`

## Additional Documentation References

### Core Project Files
- **`README.md`** - Project overview, setup instructions, tech stack
- **`docs/developer/LottieAnimations.md`** - Lottie animations usage guide

### Development Tools
- **`Taskfile.yaml`** - Available pls commands and scripts
- **`wrangler.toml`** - Cloudflare Workers configuration
- **`package.json`** - Dependencies and npm scripts

**Note:** Always check these files for the most current information and detailed implementation guidance.

---

## Quick Reference

### Common Patterns
```typescript
// SSR Page
export async function getServerSideProps(context) {
  return { props: { data: await fetchData() } }
}

// API Route
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' })
}

// Lottie Animation
import { InlineLottie } from '@/components/lottie'
import animationData from '/public/animations/loading.json'
```

### File Extensions
- `.tsx` → React components
- `.ts` → TypeScript utilities
- `.json` → Lottie animations, configuration
- `.md` → Documentation

### Import Patterns
- `@/` → Absolute imports from src/
- `/public/` → Static assets
- Relative imports for local files 