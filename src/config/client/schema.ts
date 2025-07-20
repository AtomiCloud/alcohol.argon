import { z } from 'zod';

export const clientSchema = z.object({
  landscape: z.string().default('unknown'),
  faro: z.object({
    enabled: z.boolean().default(false),
    collectorurl: z.string().default(''),
    sessionTracking: z.object({
      enabled: z.boolean().default(true),
      samplingRate: z.number().min(0).max(1).default(1),
    }),
    build: z.object({
      enabled: z.boolean(),
      endpoint: z.string(),
      app: z.string(),
      stack: z.string(),
      key: z.string(),
      gzipContents: z.boolean().default(true),
    }),
  }),
});

export type ClientConfig = z.infer<typeof clientSchema>;
