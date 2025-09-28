import { createBridge } from './core';
import type { ProblemProviderProps } from '@/lib/problem/providers';
import type { ConfigProviderProps } from '@/lib/config/providers';
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
import { ProblemReporterProvider, type ProblemReporterProviderProps } from '@/adapters/problem-reporter/providers';
import type { ApiProviderProps } from '@/lib/api/providers';
import {
  type AdaptedClientTree,
  type AdaptedConfigSchema,
  type AdaptedProblemDefinition,
  buildTime,
} from '@/adapters/external/core';
import { useAuth } from '@/lib/auth/providers/hooks';
import { TrackerProvider } from '@/lib/tracker/provider';

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
    const { retriever } = useAuth();
    return {
      config: {
        defaultInstance: buildTime.defaultInstance,
        problemTransformer,
        clientTree: buildTime.clientTree(common, retriever),
      },
    };
  },
);

function BridgedTrackerProvider({ children }: { children: React.ReactNode }) {
  const clientConfig = useClientConfig();
  const tracker = clientConfig.tracker;
  return (
    <TrackerProvider fathomProps={tracker.fathom} plausibleProps={tracker.plausible}>
      {children}
    </TrackerProvider>
  );
}

export {
  BridgedProblemProvider,
  BridgedTrackerProvider,
  BridgedConfigProvider,
  BridgedProblemReporterProvider,
  BridgedApiClientProvider,
};
