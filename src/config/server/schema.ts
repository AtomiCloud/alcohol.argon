import { z } from 'zod';

export const serverSchema = z.object({
  landscape: z.string().default('unknown'),
});

export type ServerConfig = z.infer<typeof serverSchema>;
