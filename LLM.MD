# LLM Guide

**Always refer to this file before making changes.**

## Project
- **Name**: Alcohol Argon (Nix-based)
- **Principles**: Reproducible environments, centralized tasks, comprehensive linting, conventional commits

## Tools
- **Core**: `pls`, `sg`, `git`, `bun`, `infisical`
- **Linting**: `treefmt`, `gitlint`, `shellcheck`, `biome`
- **Environment**: `atomiutils`, shells (default/ci/releaser)
- **Source**: `nix/packages.nix`

## Commands
```bash
pls setup     # Initialize repository
pls lint      # Lint all files (REQUIRED before commits)
pls --list    # Show available tasks
nix develop   # Enter dev shell
treefmt       # Format code
infisical scan . # Scan secrets
```

## Structure
- `.github/workflows/` → CI/CD
- `docs/developer/` → Documentation
- `nix/` → Nix configuration
- `scripts/ci/` → CI scripts
- `scripts/local/` → Development scripts
- `Taskfile.yaml` → Task definitions
- `flake.nix` → Main Nix config
- `atomi_release.yaml` → Release config

## Workflow
1. **Environment** → Auto-loaded via direnv or `nix develop`
2. **Changes** → Make code changes
3. **Lint** → Run `pls lint` (CRITICAL)
4. **Commit** → Use conventional commit format

## Linting
- **biome** → JS/TS linting
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
5. Tasks in Taskfile.yaml only 