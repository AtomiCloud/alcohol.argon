import { AlcoholZincApi } from '@/clients/alcohol/zinc/api';
import { PROBLEM_DEFINITIONS } from '@/problems';
import { configSchemas } from '@/config';
import { importedConfigurations } from '@/config/configs';
import { envLandscapeSource } from '@/lib/landscape/core';

const apiTree = {
  alcohol: {
    zinc: new AlcoholZincApi(),
  },
};

const buildTime = {
  PROBLEM_DEFINITIONS,
  configSchemas,
  apiTree,
  importedConfigurations,
  landscapeSource: envLandscapeSource,
  defaultInstance: 'global',
};
export { buildTime };
