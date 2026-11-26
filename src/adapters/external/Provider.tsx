import { createApiProvider } from '@/lib/api/providers';
import type { AdaptedClientTree, AdaptedProblemDefinition } from '@/adapters/external/core';
import { createModuleProvider } from '@/lib/module/providers';
import type { PublicConfig } from '@/config/public';
import { createProblemProvider } from '@/lib/problem/providers';

const { useSwaggerClients, useApiContext, ApiProvider } = createApiProvider<
  AdaptedClientTree,
  AdaptedProblemDefinition
>();

const { useContext: useConfigContext, Provider: ConfigProvider } = createModuleProvider<PublicConfig, PublicConfig>({
  name: 'Config',
  builder: config => config,
});

function useCommonConfig() {
  return useConfigContext().resource.common;
}

function useClientConfig() {
  return useConfigContext().resource.client;
}

function useConfig() {
  return useConfigContext().resource;
}

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
  useCommonConfig,
  useConfig,
  useClientConfig,
  useConfigContext,
  ConfigProvider,
};
