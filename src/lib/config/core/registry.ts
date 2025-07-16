import type { z } from 'zod';

type ConfigSchemas = {
  common: z.ZodSchema;
  client: z.ZodSchema;
  server: z.ZodSchema;
};

type ValidatedConfigs<T extends ConfigSchemas> = {
  common: z.infer<T['common']>;
  client: z.infer<T['client']>;
  server: z.infer<T['server']>;
};

class ConfigRegistry<T extends ConfigSchemas> {
  private readonly configs: ValidatedConfigs<T>;

  constructor(configs: ValidatedConfigs<T>) {
    this.configs = configs;
  }

  getConfig(configType: 'common'): ValidatedConfigs<T>['common'];
  getConfig(configType: 'client'): ValidatedConfigs<T>['client'];
  getConfig(configType: 'server'): ValidatedConfigs<T>['server'];
  getConfig(configType: keyof ConfigSchemas): unknown {
    return this.configs[configType];
  }

  get common(): ValidatedConfigs<T>['common'] {
    return this.configs.common;
  }

  get client(): ValidatedConfigs<T>['client'] {
    return this.configs.client;
  }

  get server(): ValidatedConfigs<T>['server'] {
    return this.configs.server;
  }

  getAllConfigs(): ValidatedConfigs<T> {
    return this.configs;
  }
}

export type { ConfigSchemas, ValidatedConfigs };
export { ConfigRegistry };
