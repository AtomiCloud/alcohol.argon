import { createBridge } from './core';
import type { ProblemProviderProps } from '@/lib/problem/providers';
import {
  ApiProvider,
  ProblemProvider,
  useClientConfig,
  useCommonConfig,
  useProblemTransformer,
} from '@/adapters/external/Provider';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { ProblemReporterProvider, type ProblemReporterProviderProps } from '@/adapters/problem-reporter/providers';
import type { ApiProviderProps } from '@/lib/api/providers';
import type { AdaptedClientTree, AdaptedProblemDefinition } from '@/adapters/external/core';
import { clientTree } from '@/adapters/external/shared';
import { PROBLEM_DEFINITIONS } from '@/problems';
import { useAuth } from '@/lib/auth/providers/hooks';

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
      problemDefinitions: PROBLEM_DEFINITIONS,
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
        defaultInstance: 'global',
        problemTransformer,
        clientTree: clientTree(common, retriever),
      },
    };
  },
);

export { BridgedProblemProvider, BridgedProblemReporterProvider, BridgedApiClientProvider };
