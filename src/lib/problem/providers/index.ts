import { createModuleProvider, type ModuleProviderProps } from '@/lib/module/providers';
import {
  problemBuilder,
  type ProblemDefinitions,
  type ProblemModuleInput,
  type ProblemModuleOutput,
  type ProblemRegistry,
  type ProblemTransformer,
} from '@/lib/problem/core';

type ProblemProviderProps<T extends ProblemDefinitions> = ModuleProviderProps<ProblemModuleInput<T>>;

function createProblemProvider<T extends ProblemDefinitions>() {
  const { Provider, useContext } = createModuleProvider<ProblemModuleInput<T>, ProblemModuleOutput<T>>({
    name: 'Problem',
    builder: input => problemBuilder(input),
  });

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
