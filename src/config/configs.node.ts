import type { ImportedConfigurations } from '@/lib/config/core/loader';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

/**
 * Node.js compatible configuration loader for build-time usage
 * Used in next.config.ts where webpack loaders are not available
 */

const configRoot = join(process.cwd(), 'src/config');

// Helper function to load YAML file
function loadYaml(relativePath: string): unknown {
  const fullPath = join(configRoot, relativePath);
  const content = readFileSync(fullPath, 'utf8');
  return yaml.load(content);
}

export function loadImportedConfigurations(): ImportedConfigurations {
  // Load common configurations
  const baseCommonConfig = loadYaml('common/settings.yaml');
  const laprasCommonConfig = loadYaml('common/lapras.settings.yaml');
  const pichuCommonConfig = loadYaml('common/pichu.settings.yaml');
  const pikachuCommonConfig = loadYaml('common/pikachu.settings.yaml');
  const raichuCommonConfig = loadYaml('common/raichu.settings.yaml');

  // Load client configurations
  const baseClientConfig = loadYaml('client/settings.yaml');
  const laprasClientConfig = loadYaml('client/lapras.settings.yaml');
  const pichuClientConfig = loadYaml('client/pichu.settings.yaml');
  const pikachuClientConfig = loadYaml('client/pikachu.settings.yaml');
  const raichuClientConfig = loadYaml('client/raichu.settings.yaml');

  // Load server configurations
  const baseServerConfig = loadYaml('server/settings.yaml');
  const laprasServerConfig = loadYaml('server/lapras.settings.yaml');
  const pichuServerConfig = loadYaml('server/pichu.settings.yaml');
  const pikachuServerConfig = loadYaml('server/pikachu.settings.yaml');
  const raichuServerConfig = loadYaml('server/raichu.settings.yaml');

  // All imported configurations structured for the library
  return {
    common: {
      base: baseCommonConfig,
      landscapes: {
        lapras: laprasCommonConfig,
        pichu: pichuCommonConfig,
        pikachu: pikachuCommonConfig,
        raichu: raichuCommonConfig,
      },
    },
    client: {
      base: baseClientConfig,
      landscapes: {
        lapras: laprasClientConfig,
        pichu: pichuClientConfig,
        pikachu: pikachuClientConfig,
        raichu: raichuClientConfig,
      },
    },
    server: {
      base: baseServerConfig,
      landscapes: {
        lapras: laprasServerConfig,
        pichu: pichuServerConfig,
        pikachu: pikachuServerConfig,
        raichu: raichuServerConfig,
      },
    },
  };
}
