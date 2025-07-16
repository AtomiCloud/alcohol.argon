import { z } from 'zod';

export const serverSchema = z.object({
  database: z.object({
    connections: z.number().positive().default(10),
  }),
  security: z.object({
    origins: z.array(z.string()).default([]),
  }),
});

export type ServerConfig = z.infer<typeof serverSchema>;
