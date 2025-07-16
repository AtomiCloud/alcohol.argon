# Configuration System

This directory contains the user-space configuration for the application.

> **📖 For usage instructions, see [docs/developer/Configuration.md](../../docs/developer/Configuration.md)**

## Quick Start

1. **Access configuration in components**:
   ```typescript
   import { useCommonConfig, useClientConfig } from '@/lib/config';
   
   const commonConfig = useCommonConfig();
   const clientConfig = useClientConfig();
   ```

2. **Override with environment variables**:
   ```bash
   ATOMI_COMMON__APP__NAME="My App"
   ATOMI_CLIENT__API__BASE_URL="https://api.example.com"
   ```

## Adding New Landscapes

To add a new landscape (e.g., `staging`):

1. **Create YAML files** for the new landscape:
   ```
   src/config/common/staging.settings.yaml
   src/config/client/staging.settings.yaml
   src/config/server/staging.settings.yaml  # optional
   ```

2. **Update configs.ts** to import and include the new landscape:
   ```typescript
   // Import the new configuration files
   import stagingCommonConfig from './common/staging.settings.yaml';
   import stagingClientConfig from './client/staging.settings.yaml';
   
   // Add them to the importedConfigurations
   export const importedConfigurations: ImportedConfigurations = {
     common: {
       base: baseCommonConfig,
       landscapes: {
         lapras: laprasCommonConfig,
         staging: stagingCommonConfig,  // Add this
         // ... other landscapes
       },
     },
     client: {
       base: baseClientConfig,
       landscapes: {
         lapras: laprasClientConfig,
         staging: stagingClientConfig,  // Add this
         // ... other landscapes
       },
     },
     // ... server configuration
   };
   ```

3. **Update wrangler.toml** to define the new environment:
   ```toml
   [env.staging]
   name = "your-app-staging"
   
   [env.staging.vars]
   LANDSCAPE = "staging"
   ATOMI_APP__NAME = "Your App (Staging)"
   ```

## Current Landscapes

- `lapras` - Development
- `pichu` - Staging  
- `pikachu` - Pre-production
- `raichu` - Production

## File Structure

```
src/config/
├── common/           # Shared between client and server
│   ├── settings.yaml     # Base configuration
│   ├── lapras.settings.yaml
│   ├── pichu.settings.yaml
│   ├── pikachu.settings.yaml
│   └── raichu.settings.yaml
├── client/           # Browser-safe configuration
│   ├── settings.yaml
│   ├── lapras.settings.yaml
│   ├── pichu.settings.yaml
│   ├── pikachu.settings.yaml
│   └── raichu.settings.yaml
├── server/           # Server-only configuration
│   └── settings.yaml
├── configs.ts        # Configuration imports and mapping
└── schemas.ts        # Zod validation schemas
```

## Library Documentation

For library developers and those looking to understand the internal architecture, see:
- [src/lib/config/README.md](../lib/config/README.md) - Library architecture and internal API