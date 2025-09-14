# Agent Guidelines

## Essential Commands

```bash
pls lint          # CRITICAL: Run before any changes (biome + tsc)
pls dev           # Start dev server
pls build         # Build for Cloudflare Workers
bun run type-check # TypeScript check only
```

## Code Style (Enforced)

- **Use const** - Never let/var
- **Template literals** - Prefer `${var}` over concatenation
- **Functional monads** - All internal code must use Option/Result from `@/lib/monads/`
- **No console.log** - Use proper error handling
- **No array index keys** - Use stable identifiers

## Import Patterns

```typescript
import { Some, None, Opt } from '@/lib/monads/option';
import { Ok, Err, Res } from '@/lib/monads/result';
// @/ maps to src/
```

## Critical Rules

1. **Always run `pls lint` before committing** - Prevents CI failures
2. **Convert external APIs to monads** at boundaries: `Opt.fromNative()` or `.then(Ok).catch(Err)`
3. **Never use null/undefined** - Use Option monad instead
4. **Never use try/catch** - Use Result monad instead
5. **Follow existing patterns** - Check neighboring files for conventions

## Architecture

- Next.js 15 Pages Router → Cloudflare Workers via OpenNext
- Functional monads required for all internal code
- RFC 7807 problem details for API errors
- Dependency injection via AtomiProvider
