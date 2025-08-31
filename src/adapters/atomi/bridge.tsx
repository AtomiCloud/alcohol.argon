import { createBridge } from './core';
import { ProblemProviderProps } from '@/lib/problem/providers';
import { ConfigProviderProps } from '@/lib/config/providers';
import {
  ApiProvider,
  ConfigProvider,
  ProblemProvider,
  useClientConfig,
  useCommonConfig,
  useProblemTransformer,
} from '@/adapters/external/Provider';
import { useLandscape } from '@/lib/landscape/providers';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { ProblemReporterProvider, ProblemReporterProviderProps } from '@/adapters/problem-reporter/providers';
import { ApiProviderProps } from '@/lib/api/providers';
import { AdaptedClientTree, AdaptedConfigSchema, AdaptedProblemDefinition, buildTime } from '@/adapters/external/core';

const BridgedConfigProvider = createBridge<ConfigProviderProps<AdaptedConfigSchema>>(ConfigProvider, () => {
  const landscape = useLandscape();
  return {
    config: {
      landscape,
      importedConfigurations: buildTime.importedConfigurations,
      schemas: buildTime.configSchemas,
    },
  };
});

const BridgedProblemReporterProvider = createBridge<ProblemReporterProviderProps>(ProblemReporterProvider, () => {
  const config = useClientConfig();
  return {
    config: {
      faro: config.faro.enabled,
    },
  };
});

const BridgedProblemProvider = createBridge<ProblemProviderProps<AdaptedProblemDefinition>>(ProblemProvider, () => {
  const errorReporter = useProblemReporter();
  const config = useCommonConfig();
  return {
    config: {
      config: config.errorPortal,
      errorReporter: errorReporter,
      problemDefinitions: buildTime.problemDefinitions,
    },
  };
});

const BridgedApiClientProvider = createBridge<ApiProviderProps<AdaptedClientTree, AdaptedProblemDefinition>>(
  ApiProvider,
  () => {
    const problemTransformer = useProblemTransformer();
    const common = useCommonConfig();
    return {
      config: {
        defaultInstance: buildTime.defaultInstance,
        problemTransformer,
        clientTree: buildTime.clientTree(common),
      },
    };
  },
);

export { BridgedProblemProvider, BridgedConfigProvider, BridgedProblemReporterProvider, BridgedApiClientProvider };
