type ModuleBuilder<TInput, TOutput> = (input: TInput) => TOutput | Promise<TOutput>;

interface Module<TInput, TOutput> {
  name: string;
  builder: ModuleBuilder<TInput, TOutput>;
}

export type { Module, ModuleBuilder };
