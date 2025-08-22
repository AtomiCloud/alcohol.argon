import {
  type ProblemConfig,
  type ProblemDefinitions,
  ProblemRegistry,
  type ProblemReporter,
  ProblemTransformer,
} from '@/lib/problem/core';

interface ProblemModuleInput {
  config: ProblemConfig;
  errorReporter: ProblemReporter;
}

interface ProblemModuleOutput<T extends ProblemDefinitions> {
  registry: ProblemRegistry<T>;
  transformer: ProblemTransformer<T>;
}

function problemBuilder<T extends ProblemDefinitions>(
  input: ProblemModuleInput,
  problemDefinition: T,
): ProblemModuleOutput<T> {
  const { config, errorReporter } = input;
  const registry = new ProblemRegistry(config, problemDefinition);
  const transformer = new ProblemTransformer(registry, errorReporter);
  return {
    transformer,
    registry,
  };
}

export { problemBuilder };
export type { ProblemModuleInput, ProblemModuleOutput };
