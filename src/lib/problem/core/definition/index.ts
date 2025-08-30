import { httpErrorDefinition } from '@/lib/problem/core/definition/http-error';
import { localErrorDefinition } from '@/lib/problem/core/definition/local-error';
import { unknownErrorDefinition } from '@/lib/problem/core/definition/unknown-error';

const DEFAULT_PROBLEMS = {
  http_error: httpErrorDefinition,
  local_error: localErrorDefinition,
  unknown_error: unknownErrorDefinition,
} as const;

type DefaultProblems = typeof DEFAULT_PROBLEMS;

export { DEFAULT_PROBLEMS, type DefaultProblems };
