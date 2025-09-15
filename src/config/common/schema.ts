import { z } from 'zod';

export const commonSchema = z.object({
  landscape: z.string().default('unknown'),
  app: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string(),
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
  seo: z.object({
    twitter: z.object({
      site: z.string().optional(),
      creator: z.string().optional(),
    }),
    og: z.object({
      locale: z.string().default('en_US'),
    }),
  }),
  pwa: z.object({
    themeColor: z.string(),
    backgroundColor: z.string(),
    display: z.enum(['standalone', 'fullscreen', 'minimal-ui', 'browser']),
    orientation: z.enum([
      'any',
      'natural',
      'landscape',
      'portrait',
      'portrait-primary',
      'portrait-secondary',
      'landscape-primary',
      'landscape-secondary',
    ]),
    categories: z.array(z.string()),
    startUrl: z.string().default('/'),
    scope: z.string().default('/'),
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
