import { AlcoholZincApi } from '@/clients/alcohol/zinc/api';
import { PROBLEM_DEFINITIONS } from '@/problems';
import { configSchemas } from '@/config';

const apiTree = {
  alcohol: {
    zinc: new AlcoholZincApi(),
  },
};

const buildTime = {
  PROBLEM_DEFINITIONS,
  configSchemas,
  apiTree,
};
export { buildTime };
