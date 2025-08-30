import { createNextAdapter, type NextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import {
  problemBuilder,
  type ProblemDefinitions,
  type ProblemModuleInput,
  type ProblemModuleOutput,
} from '@/lib/problem/core';

function createProblemModule<T extends ProblemDefinitions>(): NextAdapter<
  ProblemModuleInput<T>,
  ProblemModuleOutput<T>
> {
  const module: NextAdapterConfig<ProblemModuleInput<T>, ProblemModuleOutput<T>> = {
    name: 'Problem',
    builder: input => problemBuilder(input),
  };
  return createNextAdapter(module);
}

export { createProblemModule };
