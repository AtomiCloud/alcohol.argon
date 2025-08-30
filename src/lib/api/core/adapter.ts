import { type ApiTree, type ClientTree, createFromClientTree } from '@/lib/api/core/swagger-adapter';
import type { ProblemDefinitions, ProblemTransformer } from '@/lib/problem/core';

type ApiModuleInput<Y extends ProblemDefinitions> = {
  defaultInstance: string;
  problemTransformer: ProblemTransformer<Y>;
};

function apiBuilder<T extends ClientTree, Y extends ProblemDefinitions>(
  input: ApiModuleInput<Y>,
  clientTree: T,
): ApiTree<T> {
  return createFromClientTree(clientTree, {
    problemTransformer: input.problemTransformer,
    instance: input.defaultInstance,
  });
}

export { apiBuilder, type ApiModuleInput };
