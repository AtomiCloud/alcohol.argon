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
nix develop   # Enter dev shell
treefmt       # Format code
infisical scan . # Scan secrets
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