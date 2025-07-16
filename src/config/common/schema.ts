import { z } from 'zod';

export const commonSchema = z.object({
  app: z.object({
    name: z.string().default('Alcohol Argon'),
    version: z.string().default('1.0.0'),
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
