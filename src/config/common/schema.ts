import { z } from 'zod';

export const commonSchema = z.object({
  app: z.object({
    name: z.string().default('Alcohol Argon'),
    version: z.string().default('1.0.0'),
  }),
  features: z.object({
    debug: z.boolean().default(false),
  }),
});

export type CommonConfig = z.infer<typeof commonSchema>;
