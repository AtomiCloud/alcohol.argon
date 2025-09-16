import type { WithApiHandler, WithServerSideHandler } from '@/lib/module/next';
import { withApiLandscape, withServerSideLandscape } from '@/lib/landscape/next';
import {
  withApiConfig,
  withApiProblem,
  withApiSwagger,
  withServerSideConfig,
  withServerSideProblem,
  withServerSideSwagger,
} from '@/adapters/external/next';
import { withApiProblemReporter, withServerSideProblemReporter } from '@/adapters/problem-reporter/next';
import type { ProblemReporter } from '@/lib/problem/core';
import type { ProblemReporterFactory } from '@/lib/problem/core/transformer';
import type { AdaptedInput } from '@/adapters/external/core';
import { withApiAuth, withServerSideAuth } from '@/lib/auth/next';
import type LogtoClient from '@logto/next';
import type { GetServerSidePropsResult } from 'next';
import { AuthChecker } from '@/lib/auth/core/checker';
import type { IAuthStateRetriever } from '@/lib/auth/core/types';
import { ServerAuthStateRetriever } from '@/lib/auth/core/server/retriever';
import { OnboardChecker } from '@/lib/onboard/checker';
import { Res } from '@/lib/monads/result';

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
  auth: {
    client: LogtoClient;
    checker: AuthChecker;
    retriever: IAuthStateRetriever;
  };
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
            return client.withLogtoApiRoute(
              async (req, res) => {
                const checker = new AuthChecker();
                const retriever = new ServerAuthStateRetriever(
                  client,
                  checker,
                  config.server.auth.logto.resources,
                  req,
                  res,
                );
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
                          clientTree: clientTree(config.common, retriever),
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
                            auth: {
                              client,
                              checker,
                              retriever,
                            },
                          });
                        },
                      )(req, res);
                    },
                  )(req, res);
                })(req, res);
              },
              { fetchUserInfo: true },
              // biome-ignore lint/suspicious/noConfusingVoidType: force library compatibility
            )(req, res) as void;
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
                const checker = new AuthChecker();
                const retriever = new ServerAuthStateRetriever(
                  client,
                  checker,
                  config.server.auth.logto.resources,
                  context.req,
                  context.res,
                );

                return withServerSideSwagger(
                  {
                    defaultInstance,
                    problemTransformer: problem.transformer,
                    clientTree: clientTree(config.common, retriever),
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
                      auth: {
                        client,
                        checker,
                        retriever,
                      },
                    });

                    const onboarder = new OnboardChecker(retriever, checker, {
                      'alcohol-zinc': {
                        creator: (idToken, accessToken) =>
                          Res.fromAsync(
                            apiTree.alcohol.zinc.api.vUserCreate(
                              { version: '1.0' },
                              {
                                accessToken,
                                idToken,
                              },
                            ),
                          ),
                      },
                    });

                    return await onboarder.onboard().match({
                      ok: async ok => {
                        return await ok.match({
                          ok: () => result,
                          err: e => {
                            return {
                              redirect: {
                                permanent: false,
                                destination: `/finish?message=${e}`,
                              },
                              // biome-ignore lint/suspicious/noExplicitAny: this is a complex type
                            } as any;
                          },
                        });
                      },
                      err: err => {
                        if ('props' in result && typeof result.props === 'object') {
                          return {
                            ...result,
                            props: {
                              ...result.props,
                              error: err,
                            },
                          };
                        }
                        return {
                          ...result,
                          props: {
                            error: err,
                          },
                        };
                      },
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

export { withApiAtomi, withServerSideAtomi, withApiLogtoOnly, serverSideNoOp };
