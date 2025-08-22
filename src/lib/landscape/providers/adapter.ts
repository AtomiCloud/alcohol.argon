import { createModuleProvider, type ModuleProviderProps, type ProviderConfig } from '@/lib/module/providers';
import { landscapeBuilder, type LandscapeModuleInput } from '@/lib/landscape/core/adapter';

type LandscapeProviderProps = ModuleProviderProps<LandscapeModuleInput>;

const module: ProviderConfig<LandscapeModuleInput, string> = {
  name: 'Landscape',
  builder: input => landscapeBuilder(input),
};
const { useContext: useLandscapeContext, Provider: LandscapeProvider } = createModuleProvider(module);

export { useLandscapeContext, LandscapeProvider, type LandscapeProviderProps };
