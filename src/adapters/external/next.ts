// api
import { createApiModule } from '@/lib/api/next';
import { createProblemModule } from '@/lib/problem/next';
import { createConfigModule } from '@/lib/config/next';
import { buildTime } from '@/adapters/external/core';

const {
  withApi: withApiSwagger,
  withStatic: withStaticSwagger,
  withServerSide: withServerSideSwagger,
} = createApiModule<typeof buildTime.apiTree, typeof buildTime.PROBLEM_DEFINITIONS>(buildTime.apiTree);

const {
  withApi: withApiProblem,
  withStatic: withStaticProblem,
  withServerSide: withServerSideProblem,
} = createProblemModule(buildTime.PROBLEM_DEFINITIONS);

const {
  withApi: withApiConfig,
  withStatic: withStaticConfig,
  withServerSide: withServerSideConfig,
} = createConfigModule(buildTime.configSchemas);

export {
  withApiSwagger,
  withServerSideSwagger,
  withStaticSwagger,
  withApiProblem,
  withStaticProblem,
  withServerSideProblem,
  withApiConfig,
  withStaticConfig,
  withServerSideConfig,
};
