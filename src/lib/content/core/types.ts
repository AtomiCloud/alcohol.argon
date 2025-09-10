import type { ResultSerial } from '@/lib/monads/result';
import type { OptionSerial } from '@/lib/monads/option';

type Content<T, Y> = ResultSerial<OptionSerial<T>, Y>;

export type { Content };
