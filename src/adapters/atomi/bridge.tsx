import { createBridge } from './core';
import { ProblemProviderProps } from '@/lib/problem/providers';
import { ConfigProviderProps } from '@/lib/config/providers';
import { ConfigProvider, ProblemProvider, useClientConfig, useCommonConfig } from '@/adapters/external/Provider';
import { useLandscape } from '@/lib/landscape/providers';
import { importedConfigurations } from '@/config/configs';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { ProblemReporterProvider, ProblemReporterProviderProps } from '@/adapters/problem-reporter/providers';

const BridgedConfigProvider = createBridge<ConfigProviderProps>(ConfigProvider, () => {
  const landscape = useLandscape();
  return {
    config: {
      landscape,
      importedConfigurations,
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

export { BridgedProblemProvider, BridgedConfigProvider, BridgedProblemReporterProvider };
