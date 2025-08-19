import type { ProblemDefinitions, ProblemRegistry, ProblemTransformer } from '../core';
import { useProblemContext } from './ProblemProvider';

function useProblemRegistry<T extends ProblemDefinitions>(): ProblemRegistry<T> {
  const { registry } = useProblemContext<T>();
  return registry;
}

function useProblemTransformer<T extends ProblemDefinitions>(): ProblemTransformer<T> {
  const { transformer } = useProblemContext<T>();
  return transformer;
}

export { useProblemRegistry, useProblemTransformer };
