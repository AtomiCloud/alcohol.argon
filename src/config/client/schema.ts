import { z } from 'zod';

export const clientSchema = z.object({
  landscape: z.string().default('unknown'),
  api: z.object({
    baseUrl: z.string().default('/api'),
    timeout: z.number().positive().default(5000),
  }),
  ui: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    animations: z.boolean().default(true),
  }),
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
