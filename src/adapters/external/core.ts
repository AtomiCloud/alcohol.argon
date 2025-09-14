import { AlcoholZincApi, type RequestParams } from '@/clients/alcohol/zinc/api';
import { PROBLEM_DEFINITIONS } from '@/problems';
import { type CommonConfig, configSchemas } from '@/config';
import { importedConfigurations } from '@/config/configs';
import { envLandscapeSource } from '@/lib/landscape/core';
import type { IAuthStateRetriever } from '@/lib/auth/core/types';

const clientTree = (i: CommonConfig, retriever: IAuthStateRetriever) => ({
  alcohol: {
    zinc: new AlcoholZincApi({
      baseUrl: i.clients.alcohol.zinc.url,
      securityWorker: async () => {
        if (retriever) {
          const r: RequestParams = await retriever
            .getTokenSet()
            .map(x => {
              if (x.value.isAuthed) {
                return {
                  headers: {
                    Authorization: `Bearer ${x.value.data.accessTokens['alcohol-zinc']}`,
                  },
                };
              }
              return {};
            })
            .unwrap();
          return r;
        }
        return {};
      },
    }),
  },
});

const buildTime = {
  problemDefinitions: PROBLEM_DEFINITIONS,
  configSchemas,
  clientTree: clientTree,
  importedConfigurations,
  landscapeSource: envLandscapeSource,
  defaultInstance: 'global',
};

type AdaptedProblemDefinition = typeof PROBLEM_DEFINITIONS;
type AdaptedConfigSchema = typeof configSchemas;
type AdaptedClientTree = ReturnType<typeof clientTree>;
type AdaptedImportedConfig = typeof importedConfigurations;
type AdaptedInput = typeof buildTime;

export { buildTime };

export type { AdaptedInput, AdaptedClientTree, AdaptedConfigSchema, AdaptedImportedConfig, AdaptedProblemDefinition };
