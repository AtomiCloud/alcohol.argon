import { createModuleProvider, type ModuleProviderProps } from '@/lib/module/providers';
import {
  problemBuilder,
  type ProblemDefinitions,
  type ProblemModuleInput,
  type ProblemModuleOutput,
  type ProblemRegistry,
  type ProblemTransformer,
} from '@/lib/problem/core';
import type { NextAdapterConfig } from '@/lib/module/next';

type ProblemProviderProps = ModuleProviderProps<ProblemModuleInput>;

function createProblemProvider<T extends ProblemDefinitions>(problemDefinition: T) {
  const module: NextAdapterConfig<ProblemModuleInput, ProblemModuleOutput<T>> = {
    name: 'Problem',
    builder: input => problemBuilder(input, problemDefinition),
  };
  const { Provider, useContext } = createModuleProvider(module);
  function useProblemRegistry(): ProblemRegistry<T> {
    const {
      resource: { registry },
    } = useContext();
    return registry;
  }

  function useProblemTransformer(): ProblemTransformer<T> {
    const {
      resource: { transformer },
    } = useContext();
    return transformer;
  }

  return {
    ProblemProvider: Provider,
    useProblemContext: useContext,
    useProblemRegistry,
    useProblemTransformer,
  };
}

export { createProblemProvider, type ProblemProviderProps };
