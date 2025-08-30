import { createModuleProvider, type ModuleProviderProps } from '@/lib/module/providers';
import {
  problemReporterBuilder,
  type ProblemReporterModuleInput,
  type ProblemReporterModuleOutput,
} from '@/adapters/problem-reporter/core/adapter';

type ProblemReporterProviderProps = ModuleProviderProps<ProblemReporterModuleInput>;

const { useContext: useProblemReporterContext, Provider: ProblemReporterProvider } = createModuleProvider<
  ProblemReporterModuleInput,
  ProblemReporterModuleOutput
>({
  name: 'ProblemReporter',
  builder: input => problemReporterBuilder(input),
});

export { useProblemReporterContext, ProblemReporterProvider, type ProblemReporterProviderProps };
