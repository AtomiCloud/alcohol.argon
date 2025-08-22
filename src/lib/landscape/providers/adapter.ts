import { createModuleProvider, type ModuleProviderProps, type ProviderConfig } from '@/lib/module/providers';
import { landscapeBuilder, type LandscapeModuleInput } from '@/lib/landscape/core/adapter';

type LandscapeProviderProps = ModuleProviderProps<LandscapeModuleInput>;

const { useContext: useLandscapeContext, Provider: LandscapeProvider } = createModuleProvider<
  LandscapeModuleInput,
  string
>({
  name: 'Landscape',
  builder: input => landscapeBuilder(input),
});
export { useLandscapeContext, LandscapeProvider, type LandscapeProviderProps };
