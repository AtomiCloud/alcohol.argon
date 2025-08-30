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
import { buildTime } from '@/adapters/external/core';

const BridgedConfigProvider = createBridge<ConfigProviderProps>(ConfigProvider, () => {
  const landscape = useLandscape();
  return {
    config: {
      landscape,
      importedConfigurations: buildTime.importedConfigurations,
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

const BridgedProblemProvider = createBridge<ProblemProviderProps>(ProblemProvider, () => {
  const errorReporter = useProblemReporter();
  const config = useCommonConfig();
  return {
    config: {
      config: config.errorPortal,
      errorReporter: errorReporter,
    },
  };
});

const BridgedApiClientProvider = createBridge<ApiProviderProps<typeof buildTime.PROBLEM_DEFINITIONS>>(
  ApiProvider,
  () => {
    const problemTransformer = useProblemTransformer();
    return {
      config: {
        defaultInstance: buildTime.defaultInstance,
        problemTransformer,
      },
    };
  },
);

export { BridgedProblemProvider, BridgedConfigProvider, BridgedProblemReporterProvider, BridgedApiClientProvider };
