import { z } from 'zod';

// Consumed by next.config.ts only. Never part of ClientConfig or page props.
export const faroBuildSchema = z.object({
  enabled: z.boolean(),
  endpoint: z.string(),
  app: z.string(),
  stack: z.string(),
  key: z.string(),
  gzipContents: z.boolean().default(true),
});
