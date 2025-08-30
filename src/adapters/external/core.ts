import { AlcoholZincApi } from '@/clients/alcohol/zinc/api';
import { PROBLEM_DEFINITIONS } from '@/problems';
import { configSchemas } from '@/config';
import { importedConfigurations } from '@/config/configs';
import { envLandscapeSource } from '@/lib/landscape/core';

type ClientTreeInput = {
  alcohol: {
    zinc: {
      baseUrl: string;
    };
  };
};

const clientTree = (i: ClientTreeInput) => ({
  alcohol: {
    zinc: new AlcoholZincApi({
      baseUrl: i.alcohol.zinc.baseUrl,
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
