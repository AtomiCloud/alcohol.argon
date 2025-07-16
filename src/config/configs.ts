import type { ImportedConfigurations } from '@/lib/config/core/loader';

// Common configurations
import baseCommonConfig from './common/settings.yaml';
import laprasCommonConfig from './common/lapras.settings.yaml';
import pichuCommonConfig from './common/pichu.settings.yaml';
import pikachuCommonConfig from './common/pikachu.settings.yaml';
import raichuCommonConfig from './common/raichu.settings.yaml';

// Client configurations
import baseClientConfig from './client/settings.yaml';
import laprasClientConfig from './client/lapras.settings.yaml';
import pichuClientConfig from './client/pichu.settings.yaml';
import pikachuClientConfig from './client/pikachu.settings.yaml';
import raichuClientConfig from './client/raichu.settings.yaml';

// Server configurations
import baseServerConfig from './server/settings.yaml';

// All imported configurations structured for the library
export const importedConfigurations: ImportedConfigurations = {
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
      // Add server landscape configs here if needed:
      // raichu: raichuServerConfig,
    },
  },
};
