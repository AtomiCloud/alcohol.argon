import { createNextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import { landscapeBuilder, type LandscapeModuleInput } from '@/lib/landscape/core/adapter';

const module: NextAdapterConfig<LandscapeModuleInput, string> = {
  name: 'Landscape',
  builder: input => landscapeBuilder(input),
};

const {
  withServerSide: withServerSideLandscape,
  withStatic: withStaticLandscape,
  withApi: withApiLandscape,
} = createNextAdapter(module);

export { withStaticLandscape, withApiLandscape, withServerSideLandscape };
