import { commonSchema } from './common/schema';
import { clientSchema } from './client/schema';
import { serverSchema } from './server/schema';
import { importedConfigurations } from './configs';

export { commonSchema, clientSchema, serverSchema, importedConfigurations };

export const configSchemas = {
  common: commonSchema,
  client: clientSchema,
  server: serverSchema,
};

// Export types for use in application code
export type { CommonConfig } from './common/schema';
export type { ClientConfig } from './client/schema';
export type { ServerConfig } from './server/schema';
