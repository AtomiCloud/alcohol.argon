import { z } from 'zod';

export const clientSchema = z.object({
  api: z.object({
    baseUrl: z.string().default('/api'),
    timeout: z.number().positive().default(5000),
  }),
  ui: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    animations: z.boolean().default(true),
  }),
});

export type ClientConfig = z.infer<typeof clientSchema>;
