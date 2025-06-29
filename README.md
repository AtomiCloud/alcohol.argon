# Alcohol Argon

Next.js SSR frontend with OpenNext on Cloudflare Workers, featuring modern UI components and optimal performance.

## Tech Stack

- **Framework**: Next.js 15 with Pages Router
- **Runtime**: Cloudflare Workers via OpenNext
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Package Manager**: Bun
- **Environment**: Nix-based development environment

## Architecture

- **SSR**: Server-Side Rendering for dynamic content
- **Static Assets**: Optimally cached via Cloudflare CDN
- **Edge Runtime**: Global performance with Cloudflare Workers
- **Caching**: R2 bucket support for incremental cache

## Development

### Prerequisites

- Nix with flakes enabled (for development environment)
- Cloudflare account (for deployment)

### Setup

1. **Enter development environment**:
   ```bash
   nix develop  # Automatically loaded via direnv
   ```

2. **Install dependencies**:
   ```bash
   pls setup
   ```

3. **Start development server**:
   ```bash
   pls dev
   ```

### Commands

All commands use `pls` (task runner):

```bash
# Development
pls dev       # Start Next.js dev server
pls preview   # Preview with Workers runtime

# Building & Deployment  
pls build     # Build for production
pls deploy    # Deploy to Cloudflare Workers

# Utilities
pls cf-typegen # Generate Cloudflare types
pls lint      # Run all linters
pls --list    # Show all available tasks
```

### Local Development

- **Next.js Dev Server**: `pls dev` - Standard Next.js development
- **Workers Runtime**: `pls preview` - Test with Cloudflare Workers runtime locally

## Static Assets Strategy

Optimized for performance and cost:

- **`/_next/static/*`**: Immutable cache (1 year) - Build assets never change
- **Images**: Daily cache (24 hours) - Balance between freshness and performance  
- **CDN**: Served from Cloudflare's global edge network
- **Headers**: Configured in `public/_headers` for optimal caching

This approach provides:
- ⚡ **Best Performance**: Static assets served from edge locations globally
- 💰 **Lowest Cost**: Minimal origin requests due to aggressive caching
- 📈 **Best Scalability**: CDN handles traffic spikes automatically

## Deployment

### Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler Authentication**: 
   ```bash
   bunx wrangler login
   ```

### Deploy

```bash
pls deploy
```

### Optional: R2 Caching

For enhanced caching with R2 bucket:

1. Create R2 bucket in Cloudflare dashboard
2. Update `wrangler.toml`:
   ```toml
   [[r2_buckets]]
   binding = "NEXT_INC_CACHE_R2_BUCKET"
   bucket_name = "your-bucket-name"
   ```

## Project Structure

```
argon/
├── src/
│   ├── pages/           # Next.js pages (Pages Router)
│   ├── components/      # React components
│   │   └── ui/         # shadcn/ui components
│   ├── lib/            # Utilities
│   └── styles/         # Global styles
├── public/             # Static assets
│   └── _headers        # Cloudflare caching rules
├── nix/                # Nix configuration
├── scripts/            # Development scripts
├── open-next.config.ts # OpenNext configuration
├── wrangler.toml       # Cloudflare Workers config
├── .dev.vars          # Local environment variables
├── Taskfile.yaml      # Task definitions
└── LLM.MD             # Development guidelines
```

## Key Features

- ✅ **SSR**: Full server-side rendering with `getServerSideProps`
- ✅ **TypeScript**: Full type safety with generated Cloudflare types
- ✅ **Modern UI**: shadcn/ui components with Tailwind CSS
- ✅ **Edge Runtime**: Cloudflare Workers for global performance
- ✅ **Optimized Caching**: Smart static asset caching strategy
- ✅ **Development DX**: Hot reload, type checking, linting
- ✅ **Nix Environment**: Reproducible development environment

## Environment Variables

- `NEXTJS_ENV`: Controls .env file loading (development/production)
- Cloudflare bindings available via `getCloudflareContext()` in production

## Contributing

1. Follow the guidelines in `LLM.MD`
2. All linting is handled by pre-commit hooks
3. Use `pls` commands for all tasks
4. Ensure static assets have proper cache headers

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed with `pls setup`
2. **Type Errors**: Run `pls cf-typegen` to regenerate Cloudflare types
3. **Deployment Issues**: Verify Wrangler authentication with `bunx wrangler whoami`

### Performance

- Static assets are cached aggressively for optimal performance
- SSR pages are rendered at edge locations for low latency
- Bundle size is optimized by Next.js and OpenNext

For more detailed development guidelines, see `LLM.MD`. 