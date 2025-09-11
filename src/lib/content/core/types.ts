import type { Result } from '@/lib/monads/result';

type AtomiContent<T, Y> = Result<T, Y> | Promise<Result<T, Y>>;

export type { AtomiContent };
