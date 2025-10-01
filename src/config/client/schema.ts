import { z } from 'zod';

export const clientSchema = z.object({
  landscape: z.string().default('unknown'),
  features: z
    .object({
      showStreaks: z.boolean().default(false),
      emojiTitles: z.boolean().default(true),
    })
    .default({ showStreaks: false, emojiTitles: true }),
  support: z.object({
    email: z.email(),
  }),
  // Legacy/simple toggle requested: when false, hide auth/login button
  navbarshowoff: z.boolean().default(true),
  // UI-related toggles for client rendering
  navbar: z
    .object({
      // When true, show the auth/login controls in the navbar
      showAuth: z.boolean().default(true),
    })
    .default({ showAuth: true }),
  tracker: z.object({
    plausible: z.object({
      enabled: z.boolean().default(false),
      domain: z.string(),
    }),
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
