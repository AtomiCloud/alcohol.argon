import { createApiProvider } from '@/lib/api/providers';
import { buildTime } from '@/adapters/external/core';
import { createConfigProvider } from '@/lib/config/providers';
import { createProblemProvider } from '@/lib/problem/providers';

const { useSwaggerClients, useApiContext, ApiProvider } = createApiProvider(buildTime.apiTree);

const { useConfigRegistry, useCommonConfig, useConfig, useClientConfig, useConfigContext, ConfigProvider } =
  createConfigProvider(buildTime.configSchemas);

const { useProblemContext, useProblemTransformer, useProblemRegistry, ProblemProvider } = createProblemProvider(
  buildTime.PROBLEM_DEFINITIONS,
);

export {
  useProblemContext,
  useProblemTransformer,
  useProblemRegistry,
  ProblemProvider,
  useSwaggerClients,
  useApiContext,
  ApiProvider,
  useConfigRegistry,
  useCommonConfig,
  useConfig,
  useClientConfig,
  useConfigContext,
  ConfigProvider,
};
