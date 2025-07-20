import {
  type ConfigSchemas,
  ConfigurationLoader,
  ConfigurationManager,
  ConfigurationMerger,
  ConfigurationValidator,
} from '.';

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
