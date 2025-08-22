import type { ConfigSchemas } from './registry';
import { ConfigurationManager } from './manager';
import { ConfigurationLoader } from './loader';
import { ConfigurationMerger } from './merge';
import { ConfigurationValidator } from './validator';

function createConfigManager<T extends ConfigSchemas>(
  landscape: string,
  fallbackToBase = true,
  envPrefix = 'ATOMI_',
  throwOnFirstError = false,
): ConfigurationManager<T> {
  const cfgLoader = new ConfigurationLoader(landscape, fallbackToBase);
  const cfgMerger = new ConfigurationMerger(envPrefix);
  const cfgValidator = new ConfigurationValidator(throwOnFirstError);
  return new ConfigurationManager(cfgLoader, cfgMerger, cfgValidator);
}

export { createConfigManager };
