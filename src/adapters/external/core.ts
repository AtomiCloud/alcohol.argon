import { AlcoholZincApi } from '@/clients/alcohol/zinc/api';
import { PROBLEM_DEFINITIONS } from '@/problems';
import { type CommonConfig, configSchemas } from '@/config';
import { importedConfigurations } from '@/config/configs';
import { envLandscapeSource } from '@/lib/landscape/core';

const clientTree = (i: CommonConfig) => ({
  alcohol: {
    zinc: new AlcoholZincApi({
      baseUrl: i.clients.alcohol.zinc.url,
    }),
  },
});

const buildTime = {
  problemDefinitions: PROBLEM_DEFINITIONS,
  configSchemas,
  clientTree: clientTree,
  importedConfigurations,
  landscapeSource: envLandscapeSource,
  defaultInstance: 'global',
};

type AdaptedProblemDefinition = typeof PROBLEM_DEFINITIONS;
type AdaptedConfigSchema = typeof configSchemas;
type AdaptedClientTree = ReturnType<typeof clientTree>;
type AdaptedImportedConfig = typeof importedConfigurations;
type AdaptedInput = typeof buildTime;

export { buildTime };

export type { AdaptedInput, AdaptedClientTree, AdaptedConfigSchema, AdaptedImportedConfig, AdaptedProblemDefinition };
