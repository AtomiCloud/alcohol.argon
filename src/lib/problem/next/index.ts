import { createNextAdapter, type NextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import {
  problemBuilder,
  type ProblemDefinitions,
  type ProblemModuleInput,
  type ProblemModuleOutput,
} from '@/lib/problem/core';

function createProblemModule<T extends ProblemDefinitions>(
  problemDefinition: T,
): NextAdapter<ProblemModuleInput, ProblemModuleOutput<T>> {
  const module: NextAdapterConfig<ProblemModuleInput, ProblemModuleOutput<T>> = {
    name: 'Problem',
    builder: input => problemBuilder(input, problemDefinition),
  };
  return createNextAdapter(module);
}

export { createProblemModule };
