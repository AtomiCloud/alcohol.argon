import { z } from 'zod';

export const commonSchema = z.object({
  landscape: z.string().default('unknown'),
  app: z.object({
    name: z.string().default('Alcohol Argon'),
    version: z.string().default('1.0.0'),
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
  features: z.object({
    debug: z.boolean().default(false),
  }),
  errorPortal: z.object({
    baseUri: z.string().default('https://api.zinc.sulfone.pichu.cluster.atomi.cloud'),
    version: z.string().default('1.0'),
    service: z.string().default('argon'),
  }),
});

export type CommonConfig = z.infer<typeof commonSchema>;
