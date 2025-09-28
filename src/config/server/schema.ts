import { z } from 'zod';

export const serverSchema = z.object({
  landscape: z.string().default('unknown'),
  auth: z.object({
    logto: z.object({
      app: z.object({
        secret: z.string(),
        id: z.string(),
        endpoint: z.string(),
      }),
      url: z.string(),
      cookie: z.object({
        secret: z.string(),
      }),
      resources: z.record(z.string(), z.url()),
      scopes: z.array(z.string()).default(['openid', 'profile', 'offline_access', 'email']),
    }),
  }),
  db: z.object({
    url: z.string(),
  }),
});

export type ServerConfig = z.infer<typeof serverSchema>;
