import type { z } from 'zod';

export type ConfigSchemas = {
  common: z.ZodSchema;
  client: z.ZodSchema;
  server?: z.ZodSchema;
};

export type ValidatedConfigs<T extends ConfigSchemas> = {
  common: z.infer<T['common']>;
  client: z.infer<T['client']>;
  server: T['server'] extends z.ZodSchema ? z.infer<T['server']> : undefined;
};

interface RegistryEntry<T extends ConfigSchemas> {
  schemas: T;
  configs: ValidatedConfigs<T>;
}

// Global registry to store configuration schemas and validated data
const registry = new Map<string, RegistryEntry<ConfigSchemas>>();

// Symbol for type-safe access
const REGISTRY_KEY = Symbol('config-registry');

export function registerSchemas<T extends ConfigSchemas>(schemas: T, configs: ValidatedConfigs<T>): void {
  const key = REGISTRY_KEY.toString();

  if (registry.has(key)) {
    throw new Error('Configuration schemas have already been registered. Multiple registrations are not allowed.');
  }

  registry.set(key, { schemas, configs });
}

export function getValidatedConfig(configType: keyof ConfigSchemas): unknown {
  const key = REGISTRY_KEY.toString();
  const entry = registry.get(key);

  if (!entry) {
    throw new Error(
      'Configuration schemas have not been registered. Make sure to use ConfigProvider at the root of your application.',
    );
  }

  return entry.configs[configType];
}

export function getSchema(configType: keyof ConfigSchemas): z.ZodSchema {
  const key = REGISTRY_KEY.toString();
  const entry = registry.get(key);

  if (!entry) {
    throw new Error(
      'Configuration schemas have not been registered. Make sure to use ConfigProvider at the root of your application.',
    );
  }

  const schema = entry.schemas[configType];
  if (!schema) {
    throw new Error(`Schema not found for config type: ${configType}`);
  }
  return schema;
}

export function isRegistryInitialized(): boolean {
  const key = REGISTRY_KEY.toString();
  return registry.has(key);
}

export function clearRegistry(): void {
  registry.clear();
}
