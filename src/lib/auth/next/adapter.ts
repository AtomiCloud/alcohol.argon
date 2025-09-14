import { createNextAdapter, type NextAdapterConfig } from '@/lib/module/next';
import { authBuilder, type AuthModuleInput, type AuthModuleOutput } from '@/lib/auth/core/server/adapter';

const module: NextAdapterConfig<AuthModuleInput, AuthModuleOutput> = {
  name: 'Auth',
  builder: input => authBuilder(input),
};

const {
  withServerSide: withServerSideAuth,
  withStatic: withStaticAuth,
  withApi: withApiAuth,
} = createNextAdapter(module);

export { withServerSideAuth, withStaticAuth, withApiAuth };
