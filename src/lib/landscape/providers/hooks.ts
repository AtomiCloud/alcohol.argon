import { useLandscapeContext } from '@/lib/landscape/providers/LandscapeProvider';

function useLandscape() {
  const { landscape } = useLandscapeContext();
  return landscape;
}

export { useLandscape };
