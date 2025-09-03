import type { WithApiHandler, WithServerSideHandler, WithStaticHandler } from '@/lib/module/next';
import { withApiLandscape, withServerSideLandscape, withStaticLandscape } from '@/lib/landscape/next';
import {
  withApiConfig,
  withApiProblem,
  withApiSwagger,
  withServerSideConfig,
  withServerSideProblem,
  withServerSideSwagger,
  withStaticConfig,
  withStaticProblem,
  withStaticSwagger,
} from '@/adapters/external/next';
import {
  withApiProblemReporter,
  withServerSideProblemReporter,
  withStaticProblemReporter,
} from '@/adapters/problem-reporter/next';
import type { ProblemReporter } from '@/lib/problem/core';
import type { ProblemReporterFactory } from '@/lib/problem/core/transformer';
import type { AdaptedInput } from '@/adapters/external/core';
import { withApiAuth, withServerSideAuth, withStaticAuth } from '@/lib/auth/next';
import type LogtoClient from '@logto/next';
import type { GetServerSidePropsResult } from 'next';
import type { AuthState } from '@/lib/auth/core/types';
import { AuthManager } from '@/lib/auth/next/util';

// biome-ignore lint/suspicious/noExplicitAny: Generic ApiOut must allow any type for extension
type ApiOutput<T extends WithApiHandler<any, any>> = Parameters<Parameters<T>[1]>[2];

type AtomiOutput = {
  landscape: string;
  config: ApiOutput<typeof withApiConfig>;
  problemRegistry: ApiOutput<typeof withApiProblem>['registry'];
  problemTransformer: ApiOutput<typeof withApiProblem>['transformer'];
  apiTree: ApiOutput<typeof withApiSwagger>;
  problemReporter: ProblemReporter;
  problemReporterFactory: ProblemReporterFactory;
  auth: LogtoClient;
  authState: AuthState;
};

const withApiAtomi: WithApiHandler<AdaptedInput, AtomiOutput> = (
  { importedConfigurations, landscapeSource, defaultInstance, clientTree, configSchemas, problemDefinitions },
  handler,
) => {
  return withApiLandscape({ source: landscapeSource }, (req, res, landscape) => {
    return withApiConfig(
      {
        landscape,
        importedConfigurations,
        schemas: configSchemas,
      },
      (req, res, config) => {
        return withApiAuth(
          {
            endpoint: config.server.auth.logto.app.endpoint,
            landscape,
            appId: config.server.auth.logto.app.id,
            appSecret: config.server.auth.logto.app.secret,
            baseUrl: config.server.auth.logto.url,
            cookieSecret: config.server.auth.logto.cookie.secret,
            resourceTree: config.server.auth.logto.resources,
            scopes: config.server.auth.logto.scopes,
          },
          (req, res, { client }) => {
            client.withLogtoApiRoute(async (req, res) => {
              const authManager = new AuthManager(client, config.server.auth.logto.resources);
              const authState = await authManager.getAuthState(req, res);

              return withApiProblemReporter({ faro: false }, (req, res, problemReporter) => {
                return withApiProblem(
                  {
                    errorReporter: problemReporter.reporter,
                    config: config.common.errorPortal,
                    problemDefinitions,
                  },
                  (req, res, problem) => {
                    return withApiSwagger(
                      {
                        defaultInstance,
                        problemTransformer: problem.transformer,
                        clientTree: clientTree(config.common),
                      },
                      (req, res, apiTree) => {
                        return handler(req, res, {
                          landscape,
                          config,
                          problemRegistry: problem.registry,
                          problemTransformer: problem.transformer,
                          apiTree,
                          problemReporter: problemReporter.reporter,
                          problemReporterFactory: problemReporter.factory,
                          auth: client,
                          authState,
                        });
                      },
                    )(req, res);
                  },
                )(req, res);
              })(req, res);
            })(req, res);
          },
        )(req, res);
      },
    )(req, res);
  });
};

const withApiLogtoOnly: WithApiHandler<AdaptedInput, LogtoClient> = (
  { importedConfigurations, landscapeSource, defaultInstance, clientTree, configSchemas, problemDefinitions },
  handler,
) => {
  return withApiLandscape({ source: landscapeSource }, (req, res, landscape) => {
    return withApiConfig(
      {
        landscape,
        importedConfigurations,
        schemas: configSchemas,
      },
      (req, res, config) => {
        return withApiAuth(
          {
            endpoint: config.server.auth.logto.app.endpoint,
            landscape,
            appId: config.server.auth.logto.app.id,
            appSecret: config.server.auth.logto.app.secret,
            baseUrl: config.server.auth.logto.url,
            cookieSecret: config.server.auth.logto.cookie.secret,
            resourceTree: config.server.auth.logto.resources,
            scopes: config.server.auth.logto.scopes,
          },
          (req, res, { client }) => {
            return handler(req, res, client);
          },
        )(req, res);
      },
    )(req, res);
  });
};

const withServerSideAtomi: WithServerSideHandler<AdaptedInput, AtomiOutput> = (
  { importedConfigurations, landscapeSource, defaultInstance, clientTree, configSchemas, problemDefinitions },
  handler,
) => {
  return withServerSideLandscape({ source: landscapeSource }, (context, landscape) => {
    return withServerSideConfig({ importedConfigurations, landscape, schemas: configSchemas }, (context, config) => {
      return withServerSideAuth(
        {
          endpoint: config.server.auth.logto.app.endpoint,
          landscape,
          appId: config.server.auth.logto.app.id,
          appSecret: config.server.auth.logto.app.secret,
          baseUrl: config.server.auth.logto.url,
          cookieSecret: config.server.auth.logto.cookie.secret,
          resourceTree: config.server.auth.logto.resources,
          scopes: config.server.auth.logto.scopes,
        },
        (context, { client }) => {
          return withServerSideProblemReporter({ faro: false }, (context, problemReporter) => {
            return withServerSideProblem(
              {
                config: config.common.errorPortal,
                errorReporter: problemReporter.reporter,
                problemDefinitions,
              },
              async (context, problem) => {
                const authManager = new AuthManager(client, config.server.auth.logto.resources);
                const authState = await authManager.getAuthState(context.req, context.res);

                return withServerSideSwagger(
                  {
                    defaultInstance,
                    problemTransformer: problem.transformer,
                    clientTree: clientTree(config.common),
                  },
                  async (context, apiTree) => {
                    const result = await handler(context, {
                      landscape,
                      config,
                      problemRegistry: problem.registry,
                      problemTransformer: problem.transformer,
                      apiTree,
                      problemReporter: problemReporter.reporter,
                      problemReporterFactory: problemReporter.factory,
                      auth: client,
                      authState,
                    });

                    if ('props' in result && typeof result.props === 'object') {
                      return {
                        ...result,
                        props: {
                          ...result.props,
                          __authState: authState,
                        },
                      };
                    }
                    return {
                      ...result,
                      props: {
                        __authState: authState,
                      },
                    };
                  },
                )(context);
              },
            )(context);
          })(context);
        },
      )(context);
    })(context);
  });
};

const withStaticAtomi: WithStaticHandler<AdaptedInput, AtomiOutput> = (
  { importedConfigurations, landscapeSource, defaultInstance, clientTree, configSchemas, problemDefinitions },
  handler,
) => {
  return withStaticLandscape({ source: landscapeSource }, (context, landscape) => {
    return withStaticConfig({ importedConfigurations, landscape, schemas: configSchemas }, (context, config) => {
      return withStaticAuth(
        {
          endpoint: config.server.auth.logto.app.endpoint,
          landscape,
          appId: config.server.auth.logto.app.id,
          appSecret: config.server.auth.logto.app.secret,
          baseUrl: config.server.auth.logto.url,
          cookieSecret: config.server.auth.logto.cookie.secret,
          resourceTree: config.server.auth.logto.resources,
          scopes: config.server.auth.logto.scopes,
        },
        async (context, { client }) => {
          return withStaticProblemReporter({ faro: false }, (context, problemReporter) => {
            return withStaticProblem(
              {
                errorReporter: problemReporter.reporter,
                config: config.common.errorPortal,
                problemDefinitions,
              },
              (context, problem) => {
                return withStaticSwagger(
                  {
                    defaultInstance,
                    problemTransformer: problem.transformer,
                    clientTree: clientTree(config.common),
                  },
                  (context, apiTree) => {
                    return handler(context, {
                      landscape,
                      config,
                      problemRegistry: problem.registry,
                      problemTransformer: problem.transformer,
                      apiTree,
                      problemReporter: problemReporter.reporter,
                      problemReporterFactory: problemReporter.factory,
                      auth: client,
                      authState: { isAuthenticated: false },
                    });
                  },
                )(context);
              },
            )(context);
          })(context);
        },
      )(context);
    })(context);
  });
};

// biome-ignore lint/complexity/noBannedTypes: this is a no-op to get initial auth tokens
const serverSideNoOp = async (): Promise<GetServerSidePropsResult<{}>> => ({ props: {} });

export { withApiAtomi, withServerSideAtomi, withStaticAtomi, withApiLogtoOnly, serverSideNoOp };
