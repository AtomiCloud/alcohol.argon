import type { LandscapeSource } from '@/lib/landscape/core/core';

interface LandscapeModuleInput {
  source: LandscapeSource;
}

function landscapeBuilder(input: LandscapeModuleInput): string {
  const { source } = input;
  return source();
}

export { landscapeBuilder, type LandscapeModuleInput };
