import { type ApiTree, type ClientTree, createFromClientTree } from '@/lib/api/core/swagger-adapter';
import type { ProblemDefinitions, ProblemTransformer } from '@/lib/problem/core';

type ApiModuleInput<T extends ClientTree, Y extends ProblemDefinitions> = {
  defaultInstance: string;
  problemTransformer: ProblemTransformer<Y>;
  clientTree: T;
};

function apiBuilder<T extends ClientTree, Y extends ProblemDefinitions>(input: ApiModuleInput<T, Y>): ApiTree<T> {
  return createFromClientTree(input.clientTree, {
    problemTransformer: input.problemTransformer,
    instance: input.defaultInstance,
  });
}

export { apiBuilder, type ApiModuleInput };
