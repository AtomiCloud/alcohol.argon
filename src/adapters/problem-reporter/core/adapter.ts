import type { ProblemReporter, ProblemReporterFactory } from '@/lib/problem/core/transformer';
import { FaroErrorReporterFactory } from '@/adapters/problem-reporter/core/problem-reporter';

interface ProblemReporterModuleInput {
  faro: boolean;
}

interface ProblemReporterModuleOutput {
  reporter: ProblemReporter;
  factory: ProblemReporterFactory;
}

function problemReporterBuilder(input: ProblemReporterModuleInput): ProblemReporterModuleOutput {
  const { faro } = input;
  const factory = new FaroErrorReporterFactory(faro);
  const reporter = factory.get();
  return {
    factory,
    reporter,
  };
}

export { problemReporterBuilder };
export type { ProblemReporterModuleInput, ProblemReporterModuleOutput };
