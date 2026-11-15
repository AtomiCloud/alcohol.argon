# Config Library

Type-safe landscape configuration with YAML loading, environment merging and Zod
validation. See `docs/developer/Configuration.md` for application integration.

## Server configuration

`ConfigurationManager` loads base → landscape → injected public build snapshot →
request-time environment, in increasing priority. It validates common/client/server
schemas and returns a `ConfigRegistry`. Supply `runtimeEnvironment` through the
Next adapter. The application reads Cloudflare bindings at request time; local
Node development uses `process.env`. Never put this registry in page props or a
browser provider. Auth secrets are required runtime inputs, not browser build data.

## Browser configuration

`src/config/public.ts` defines an explicit, typed leaf projection of the common
and client fields intended for anonymous browsers. `next.config.ts` injects only
that projection as `BUILD_TIME_PUBLIC_CONFIG`, never a raw environment bag.
The application's browser `ConfigProvider` accepts only this public snapshot.
SSR projects request-time public overrides into `_publicConfig` for hydration.
Unknown fields are private by default, even inside otherwise public objects.

Use `useConfig`, `useCommonConfig` and `useClientConfig` from
`@/adapters/external/Provider`. Do not import server config files or the generic
server config manager into browser components. Pages Router API/SSR entry points
are separate from the browser bridge; the App Router `server-only` package is
not supported by this Pages Router application.

## Build tooling

Faro upload settings live in `src/config/build` and are read only by Next's build
configuration. The old `ATOMI_CLIENT__FARO__BUILD__*` CI names remain build-only
inputs; they are not client schema fields. Runtime Faro collector/session settings
remain in the public client projection. Do not restore generic `ATOMI_` scanning
and DefinePlugin injection: a prefix is not a public-field allowlist.
