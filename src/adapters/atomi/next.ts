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
import type { buildTime } from '@/adapters/external/core';

// biome-ignore lint/suspicious/noExplicitAny: Generic ApiOut must allow any type for extension
type ApiOutput<T extends WithApiHandler<any, any>> = Parameters<Parameters<T>[1]>[2];

type AtomiInput = typeof buildTime;

type AtomiOutput = {
  landscape: string;
  config: ApiOutput<typeof withApiConfig>;
  problemRegistry: ApiOutput<typeof withApiProblem>['registry'];
  problemTransformer: ApiOutput<typeof withApiProblem>['transformer'];
  apiTree: ApiOutput<typeof withApiSwagger>;
  problemReporter: ProblemReporter;
  problemReporterFactory: ProblemReporterFactory;
};

const withApiAtomi: WithApiHandler<AtomiInput, AtomiOutput> = (
  { importedConfigurations, landscapeSource },
  handler,
) => {
  return withApiLandscape({ source: landscapeSource }, (req, res, landscape) => {
    return withApiConfig(
      {
        landscape,
        importedConfigurations: importedConfigurations,
      },
      (req, res, config) => {
        return withApiProblemReporter({ faro: false }, (req, res, problemReporter) => {
          return withApiProblem(
            {
              errorReporter: problemReporter.reporter,
              config: config.common.errorPortal,
            },
            (req, res, problem) => {
              return withApiSwagger({}, (req, res, apiTree) => {
                return handler(req, res, {
                  landscape,
                  config,
                  problemRegistry: problem.registry,
                  problemTransformer: problem.transformer,
                  apiTree,
                  problemReporter: problemReporter.reporter,
                  problemReporterFactory: problemReporter.factory,
                });
              })(req, res);
            },
          )(req, res);
        })(req, res);
      },
    )(req, res);
  });
};

const withServerSideAtomi: WithServerSideHandler<AtomiInput, AtomiOutput> = (
  { importedConfigurations, landscapeSource },
  handler,
) => {
  return withServerSideLandscape({ source: landscapeSource }, (context, landscape) => {
    return withServerSideConfig({ importedConfigurations, landscape }, (context, config) => {
      return withServerSideProblemReporter({ faro: false }, (context, problemReporter) => {
        return withServerSideProblem(
          {
            config: config.common.errorPortal,
            errorReporter: problemReporter.reporter,
          },
          (context, problem) => {
            return withServerSideSwagger({}, (context, apiTree) => {
              return handler(context, {
                landscape,
                config,
                problemRegistry: problem.registry,
                problemTransformer: problem.transformer,
                apiTree,
                problemReporter: problemReporter.reporter,
                problemReporterFactory: problemReporter.factory,
              });
            })(context);
          },
        )(context);
      })(context);
    })(context);
  });
};

const withStaticAtomi: WithStaticHandler<AtomiInput, AtomiOutput> = (
  { importedConfigurations, landscapeSource },
  handler,
) => {
  return withStaticLandscape({ source: landscapeSource }, (context, landscape) => {
    return withStaticConfig({ importedConfigurations, landscape }, (context, config) => {
      return withStaticProblemReporter({ faro: false }, (context, problemReporter) => {
        return withStaticProblem(
          {
            errorReporter: problemReporter.reporter,
            config: config.common.errorPortal,
          },
          (context, problem) => {
            return withStaticSwagger({}, (context, apiTree) => {
              return handler(context, {
                landscape,
                config,
                problemRegistry: problem.registry,
                problemTransformer: problem.transformer,
                apiTree,
                problemReporter: problemReporter.reporter,
                problemReporterFactory: problemReporter.factory,
              });
            })(context);
          },
        )(context);
      })(context);
    })(context);
  });
};

export { withApiAtomi, withServerSideAtomi, withStaticAtomi };
