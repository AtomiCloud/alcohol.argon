import { z } from 'zod';

export const clientSchema = z.object({
  landscape: z.string().default('unknown'),
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
    umami: z.union([
      z.object({
        host: z.string(),
        id: z.string(),
        proxy: z.boolean(),
      }),
      z.literal(false),
    ]),
    fathom: z
      .union([
        z.object({
          id: z.string(),
        }),
        z.literal(false),
      ])
      .default(false),
    plausible: z
      .union([
        z.object({
          domain: z.string(),
          proxy: z.boolean(),
          taggedEvents: z.boolean().optional(),
          trackFileDownloads: z.boolean().optional(),
          trackOutboundLinks: z.boolean().optional(),
          manualPageviews: z.boolean().optional(),
          selfHosted: z.boolean().optional(),
          trackLocalhost: z.boolean().optional(),
          customDomain: z.string().optional(),
        }),
        z.literal(false),
      ])
      .default(false),
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
