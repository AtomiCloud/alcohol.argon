# Landscape Upload System

This project supports uploading to multiple landscapes (environments) on releases.

## 🚀 Development Workflow

### Primary Development (Recommended)

Use the Cloudflare Workers runtime for development to match the production environment:

```bash
pls dev
```

This command:

1. Builds the application using `bunx opennextjs-cloudflare build`
2. Starts `wrangler dev` with the `lapras` (local) environment
3. Serves the app at `http://localhost:8787`
4. Includes built-in file watching and auto-reload

### Alternative Development

For faster development without Cloudflare-specific features:

```bash
pls dev-next
```

This uses the standard Next.js development server at `http://localhost:3000`.

## 🌍 Landscapes

| Landscape | Environment | Description                   |
| --------- | ----------- | ----------------------------- |
| `lapras`  | Local       | Local development environment |
| `pichu`   | Dev         | Development environment       |
| `pikachu` | Stage       | Staging environment           |
| `raichu`  | Prod        | Production environment        |

## 🚀 Usage

### Manual Upload

Upload to a specific landscape:

```bash
pls upload <landscape>
```

Examples:

```bash
pls upload pichu      # Upload to dev
pls upload pikachu    # Upload to stage
pls upload raichu     # Upload to prod
```

### How it Works

1. **Validate**: Ensures the landscape parameter is valid
2. **Build**: Builds the application using `bun run build:cf`
3. **Upload**: Uploads using `wrangler deploy --env <landscape>`

### Wrangler Configuration

Each landscape has its own wrangler environment defined in `wrangler.toml`:

```toml
[env.pichu]
name = "alcohol-argon-frontend-dev"
vars = { NEXTJS_ENV = "production", LANDSCAPE = "pichu" }
```

## 🔄 CD Integration

The system includes a CD workflow (`.github/workflows/cd.yaml`) that:

- Triggers on published releases
- Uploads to all landscapes in parallel
- Uses AtomiCloud actions and namespacelabs runners
- Follows project conventions with reusable workflows

### Secrets Required

Ensure this secret is configured in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: For Cloudflare Workers upload

## 🛠️ Script Features

The upload script (`scripts/ci/upload.sh`):

- ✅ POSIX compliant with `set -eou pipefail`
- 📤 Simple upload to specific landscape
- 🚀 Uses emoji in output for clarity
- 🐍 Uses snake_case for local variables
- 🎯 Case-based landscape validation

## 📋 Release Workflow

### Typical Release Flow

1. **Create a release**: Use GitHub's release interface or `gh release create v1.2.3`
2. **Automatic upload**: CD workflow runs and uploads to all landscapes
3. **Manual upload**: `pls upload <landscape>` (if needed)

## 🚨 Troubleshooting

### Invalid landscape

```bash
❌ Invalid landscape: invalid
📋 Available landscapes: lapras, pichu, pikachu, raichu
```

**Solution**: Use one of the valid landscape names

### Upload idempotency

Cloudflare Workers deployments are naturally idempotent - deploying the same code multiple times won't cause issues.
