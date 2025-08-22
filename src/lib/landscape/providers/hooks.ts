import { useLandscapeContext } from '@/lib/landscape/providers/adapter';

function useLandscape(): string {
  const { resource } = useLandscapeContext();
  return resource;
}

export { useLandscape };
