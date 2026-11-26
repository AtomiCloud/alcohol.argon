import { AlcoholZincApi, type RequestParams } from '@/clients/alcohol/zinc/api';
import type { CommonConfig } from '@/config/common/schema';
import type { IAuthStateRetriever } from '@/lib/auth/core/types';

export const clientTree = (i: CommonConfig, retriever: IAuthStateRetriever) => ({
  alcohol: {
    zinc: new AlcoholZincApi({
      baseUrl: i.clients.alcohol.zinc.url,
      securityWorker: async () => {
        if (retriever) {
          const r: RequestParams = await retriever
            .getTokenSet()
            .map(x => {
              if (x.value.isAuthed) {
                return { headers: { Authorization: `Bearer ${x.value.data.accessTokens['alcohol-zinc']}` } };
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
