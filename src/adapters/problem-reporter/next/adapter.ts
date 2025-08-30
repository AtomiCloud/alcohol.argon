import { createNextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import {
  problemReporterBuilder,
  type ProblemReporterModuleInput,
  type ProblemReporterModuleOutput,
} from '@/adapters/problem-reporter/core/adapter';

const module: NextAdapterConfig<ProblemReporterModuleInput, ProblemReporterModuleOutput> = {
  name: 'ProblemReporter',
  builder: input => problemReporterBuilder(input),
};

const {
  withServerSide: withServerSideProblemReporter,
  withStatic: withStaticProblemReporter,
  withApi: withApiProblemReporter,
} = createNextAdapter(module);

export { withServerSideProblemReporter, withStaticProblemReporter, withApiProblemReporter };
