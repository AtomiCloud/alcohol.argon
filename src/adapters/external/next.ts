// api
import { createApiModule } from '@/lib/api/next';
import { createProblemModule } from '@/lib/problem/next';
import { createConfigModule } from '@/lib/config/next';
import { type AdaptedClientTree, type AdaptedProblemDefinition, buildTime } from '@/adapters/external/core';

const {
  withApi: withApiSwagger,
  withStatic: withStaticSwagger,
  withServerSide: withServerSideSwagger,
} = createApiModule<AdaptedClientTree, AdaptedProblemDefinition>();

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
