import { createApiProvider } from '@/lib/api/providers';
import { AdaptedClientTree, AdaptedConfigSchema, AdaptedProblemDefinition } from '@/adapters/external/core';
import { createConfigProvider } from '@/lib/config/providers';
import { createProblemProvider } from '@/lib/problem/providers';

const { useSwaggerClients, useApiContext, ApiProvider } = createApiProvider<
  AdaptedClientTree,
  AdaptedProblemDefinition
>();

const { useConfigRegistry, useCommonConfig, useConfig, useClientConfig, useConfigContext, ConfigProvider } =
  createConfigProvider<AdaptedConfigSchema>();

const { useProblemContext, useProblemTransformer, useProblemRegistry, ProblemProvider } =
  createProblemProvider<AdaptedProblemDefinition>();

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
