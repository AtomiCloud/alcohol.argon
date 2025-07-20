import { z } from 'zod';

export const commonSchema = z.object({
  landscape: z.string().default('unknown'),
  app: z.object({
    name: z.string().default('Alcohol Argon'),
    build: z.object({
      sha: z.string().default('unknown'),
      version: z.string().default('unknown'),
      time: z.number().default(0),
    }),
    servicetree: z.object({
      landscape: z.string().default('unknown'),
      platform: z.string().default('alcohol'),
      service: z.string().default('argon'),
      module: z.string().default('webapp'),
    }),
  }),
  errorPortal: z.object({
    baseUri: z.string().default('https://api.zinc.sulfone.pichu.cluster.atomi.cloud'),
    version: z.string().default('1.0'),
    service: z.string().default('argon'),
  }),
  clients: z.object({
    alcohol: z.object({
      zinc: z.object({
        url: z.url(),
      }),
    }),
  }),
});

export type CommonConfig = z.infer<typeof commonSchema>;
