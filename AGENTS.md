# Repository Guidelines

## Project Structure & Module Organization

- Source: `src/` — Next.js (pages router) in `src/pages/`, UI in `src/components/`, shared logic in `src/lib/`, domain errors in `src/problems/`, styles in `src/styles/`.
- Assets: `public/`.
- Tooling: `Taskfile.yaml` (tasks), `wrangler.toml` (Cloudflare), `open-next.config.ts`, `flake.nix` (dev env), `scripts/` (CI/local helpers), `docs/`.
- Naming: React components use `PascalCase` (e.g., `src/components/Navbar.tsx`), primitives in `src/components/ui/*` are lowercase, utilities in `src/lib/*` prefer kebab-case (e.g., `lottie-utils.ts`). Pages/components often use default exports.

## Architecture & Stack

- Next.js Pages Router (React 18) with Bun.
- UI: Tailwind CSS 3.x, shadcn-style primitives in `src/components/ui/*`, Lucide icons.
- Data/Types: Zod, SWR, Result/Option monads.
- Platform: OpenNext → Cloudflare (Wrangler), Infisical for secrets.
- Observability/Auth: Grafana Faro, Logto.

## Command Policy

- Always use `pls` tasks. Do not run raw tools (`bun`, `node`, `wrangler`) directly.
- Before committing or opening a PR, always run `pls lint` to check your work.

## Build, Test, and Development Commands

- `pls setup` — install deps and initialize secrets login (Infisical).
- `pls dev` — start Next.js dev server with live reload and env.
- `pls build` — build via OpenNext for Cloudflare runtime.
- `pls lint` — run pre-commit hooks across the repo.
- Preview/Deploy: `pls preview`, `pls upload <landscape>`, `pls deploy <landscape> [tag]`.
- SDK generation: `pls generate:sdk:alcohol:zinc -- https://.../swagger.json` (outputs to `src/clients/alcohol/zinc/`).

## Coding Style & Naming Conventions

- TypeScript + React. Indentation 2 spaces; Prettier config in `.prettierrc.yaml` (print width 120, singleQuote true, trailing commas).
- Linting via Biome (`biome.json`): recommended rules, a11y, security, import organization. Fix issues before committing.
- Keep modules small and co-locate types with usage; prefer clear filenames over abbreviations.

## Pages & UI Guidelines

- Prefer existing shadcn-style primitives from `src/components/ui/*` before creating new components. Reuse `button`, `input`, `card`, `dropdown-menu`, etc.
- If a new primitive is needed, add it under `src/components/ui/` with consistent props (`className`, `variant`, `size`) and Tailwind classes.
- Compose pages using existing building blocks: `Layout`, `Navbar`, `Footer`, `AuthSection`, `ThemeToggle`, and UI primitives; avoid bespoke styling.
- Dark mode: ensure all components include `dark:` Tailwind variants and verify with the theme system (`useTheme` in `src/lib/theme/provider.tsx`). Test light/dark/system via the existing `ThemeToggle`.
- Before PRs, verify UI in both themes with `pls dev` and ensure no contrast or visibility regressions.

## Developer How-Tos

- Errors (RFC 7807):
  - Define Zod schema in `src/problems/definitions/*`. Register in `src/problems/registry.ts` and re-export in `src/problems/index.ts`.
  - Create instances via `problemRegistry.createProblem('id', context)`; return `Err(problem)` from functions.
  - In API routes/SSR, wrap with `withServerSideAtomi(buildTime, ...)` and `result.match({ ok, err })`; send `problem` JSON with `status`.
- API Clients:
  - Access clients via `apiTree.<platform>.<service>.<operation>(params)` inside `withServerSideAtomi` contexts. All return `Result<T, Problem>`.
  - Generate clients with `pls generate:sdk:...`; configure URLs in `src/config/**/[landscape].settings.yaml`.
- URL State:
  - Single param: `useUrlState(key, default)`.
  - Search flows: `useSearchState(defaults, onSearch, { debounceMs, validators })`.
- Configuration & Landscapes:
  - Read via `useConfig()`; landscapes: `lapras`, `pichu`, `pikachu`, `raichu`.
  - Add settings in `src/config/(common|client|server)/*` and merge through `configs.ts`.
- Auth & Observability:
  - Auth hooks: `useClaims`, `useTokens`; SSR via `auth.retriever` in `withServerSideAtomi`.
  - Report errors: `useProblemReporter().pushError(error, { source, context })`.
- More details: see `docs/developer/ProblemDetails.md`, `docs/developer/ApiClients.md`, `docs/developer/UrlState.md`, `docs/developer/Configuration.md`, `docs/developer/DependencyInjection.md`, `docs/developer/Auth.md`, and `docs/developer/Faro.md`.

## Testing Guidelines

- No formal test runner is configured yet. If you add tests, define a `pls` task to run them; do not invoke Node directly.
- Use `*.test.ts(x)` and place next to source or under `src/**/__tests__/`. Avoid network-dependent tests; mock fetch/clients.

## Commit & Pull Request Guidelines

- Conventional Commits enforced by gitlint. Allowed types: `amend, build, ci, config, dep, docs, feat, fix, perf, refactor, style, test`.
  - Example: `feat(auth): add Logto callback handler`.
- PRs: include a clear description, link issues, screenshots/GIFs for UI changes, and update docs. Ensure `pls lint` and `pls build` pass.

## Security & Configuration Tips

- Secrets via Infisical; never commit `.dev.vars` or credentials. Environments use `LANDSCAPE` (e.g., `lapras`, `pichu`, `pikachu`, `raichu`).
- Use `pls preview`, `pls upload`, and `pls deploy` for Cloudflare workflows; do not call Wrangler directly.
