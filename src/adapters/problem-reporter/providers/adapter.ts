import { createModuleProvider, type ModuleProviderProps, type ProviderConfig } from '@/lib/module/providers';
import {
  problemReporterBuilder,
  type ProblemReporterModuleInput,
  type ProblemReporterModuleOutput,
} from '@/adapters/problem-reporter/core/adapter';

type ProblemReporterProviderProps = ModuleProviderProps<ProblemReporterModuleInput>;

const module: ProviderConfig<ProblemReporterModuleInput, ProblemReporterModuleOutput> = {
  name: 'ProblemReporter',
  builder: input => problemReporterBuilder(input),
};
const { useContext: useProblemReporterContext, Provider: ProblemReporterProvider } = createModuleProvider(module);

export { useProblemReporterContext, ProblemReporterProvider, type ProblemReporterProviderProps };
