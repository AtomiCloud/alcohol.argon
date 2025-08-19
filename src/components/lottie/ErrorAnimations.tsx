import InlineLottie from './InlineLottie';
import type { Problem } from '@/lib/problem/core/types';

// Import error animation data
import astronautData from '/public/animations/errors/astronaout.json';
import catData from '/public/animations/errors/cat.json';
import chemicalData from '/public/animations/errors/chemical.json';
import coffeeData from '/public/animations/errors/coffee.json';
import cowData from '/public/animations/errors/cow.json';
import dogNewsPaperData from '/public/animations/errors/dogNewsPaper.json';
import dogSmellData from '/public/animations/errors/dogSmell.json';
import dogSwimmingData from '/public/animations/errors/dogSwimming.json';
import icecreamData from '/public/animations/errors/icecream.json';
import laptopData from '/public/animations/errors/laptop.json';
import lochnessData from '/public/animations/errors/lochness.json';
import puzzleData from '/public/animations/errors/puzzle.json';
import tissueData from '/public/animations/errors/tissue.json';

interface ErrorAnimationProps {
  className?: string;
  size?: number;
  problem?: Problem;
  status?: number; // Optional fallback if no problem provided
}

/**
 * Cheeky animation names for each error type
 */
const CHEEKY_NAMES: Record<string, string> = {
  astronaut: 'Error - Lost in Space',
  cat: 'Error - Cat broke Glass',
  chemical: 'Error - Chemical Explosion',
  coffee: 'Error - Coffee Split',
  cow: 'Error - Alien Invasion',
  dogNewsPaper: 'Error - Dog Eats Newspaper',
  dogSmell: "Error - Dog can't trace smell",
  dogSwimming: "Error - Doggy can't swim",
  icecream: 'Error - Ice-cream Melted',
  laptop: 'Error - Laptop Broken',
  lochness: 'Error - Lochness Monster Exist?',
  puzzle: 'Error - Missing Piece',
  tissue: 'Error - No Tissue',
};

/**
 * Static mapping of HTTP status codes to error animations
 * Based on semantic meaning and visual appeal
 */
const ERROR_ANIMATION_MAP: Record<number, { data: any; name: string; cheekyName: string }> = {
  // Client Errors (4xx)
  400: { data: catData, name: 'cat', cheekyName: CHEEKY_NAMES.cat },
  401: { data: dogNewsPaperData, name: 'dogNewsPaper', cheekyName: CHEEKY_NAMES.dogNewsPaper },
  403: { data: puzzleData, name: 'puzzle', cheekyName: CHEEKY_NAMES.puzzle },
  404: { data: cowData, name: 'cow', cheekyName: CHEEKY_NAMES.cow },
  409: { data: dogSmellData, name: 'dogSmell', cheekyName: CHEEKY_NAMES.dogSmell },
  418: { data: dogSwimmingData, name: 'dogSwimming', cheekyName: CHEEKY_NAMES.dogSwimming },
  422: { data: catData, name: 'cat', cheekyName: CHEEKY_NAMES.cat },
  429: { data: coffeeData, name: 'coffee', cheekyName: CHEEKY_NAMES.coffee },

  // Server Errors (5xx)
  500: { data: astronautData, name: 'astronaut', cheekyName: CHEEKY_NAMES.astronaut },
  502: { data: chemicalData, name: 'chemical', cheekyName: CHEEKY_NAMES.chemical },
  503: { data: laptopData, name: 'laptop', cheekyName: CHEEKY_NAMES.laptop },
  504: { data: icecreamData, name: 'icecream', cheekyName: CHEEKY_NAMES.icecream },

  // Network/Connection Errors
  0: { data: lochnessData, name: 'lochness', cheekyName: CHEEKY_NAMES.lochness },
};

/**
 * Default fallback animation for unmapped status codes
 */
const DEFAULT_ANIMATION = { data: tissueData, name: 'tissue', cheekyName: CHEEKY_NAMES.tissue };

/**
 * Get appropriate animation info based on HTTP status code
 */
function getAnimationForStatus(status?: number): { data: any; name: string; cheekyName: string } {
  if (!status) return DEFAULT_ANIMATION;
  return ERROR_ANIMATION_MAP[status] || DEFAULT_ANIMATION;
}

/**
 * Error animation preset component with Problem or status-based animation selection
 */
export function ErrorAnimation({ className, problem, status }: ErrorAnimationProps) {
  // Extract status from Problem if provided, otherwise use direct status
  const effectiveStatus = problem?.status ?? status;
  const animationInfo = getAnimationForStatus(effectiveStatus);

  return <InlineLottie animationData={animationInfo.data} className={className} loop={true} autoplay={true} />;
}

/**
 * Simple Problem-based error animation - just pass a Problem object
 */
export function ProblemErrorAnimation({ className, problem }: { className?: string; size?: number; problem: Problem }) {
  return <ErrorAnimation className={className} problem={problem} />;
}

// Export the mapping and functions for external use
export { ERROR_ANIMATION_MAP, DEFAULT_ANIMATION, getAnimationForStatus, CHEEKY_NAMES };
