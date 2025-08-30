import {
  type ProblemConfig,
  type ProblemDefinitions,
  ProblemRegistry,
  type ProblemReporter,
  ProblemTransformer,
} from '@/lib/problem/core';

interface ProblemModuleInput<T extends ProblemDefinitions> {
  config: ProblemConfig;
  errorReporter: ProblemReporter;
  problemDefinitions: T;
}

interface ProblemModuleOutput<T extends ProblemDefinitions> {
  registry: ProblemRegistry<T>;
  transformer: ProblemTransformer<T>;
}

function problemBuilder<T extends ProblemDefinitions>(input: ProblemModuleInput<T>): ProblemModuleOutput<T> {
  const { config, errorReporter, problemDefinitions } = input;
  const registry = new ProblemRegistry(config, problemDefinitions);
  const transformer = new ProblemTransformer(registry, errorReporter);
  return {
    transformer,
    registry,
  };
}

export { problemBuilder };
export type { ProblemModuleInput, ProblemModuleOutput };
