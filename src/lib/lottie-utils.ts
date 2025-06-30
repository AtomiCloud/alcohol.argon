/**
 * Utility functions for working with Lottie animations
 */

// Type definitions for Lottie animation data
export interface LottieAnimationData {
  op?: number; // out point (frames)
  fr?: number; // frame rate
  [key: string]: unknown;
}

/**
 * Preload a Lottie animation file
 */
export async function preloadLottieAnimation(animationName: string): Promise<LottieAnimationData> {
  try {
    const response = await fetch(`/animations/${animationName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to preload animation: ${response.statusText}`);
    }
    return (await response.json()) as LottieAnimationData;
  } catch (error) {
    console.error(`Error preloading Lottie animation "${animationName}":`, error);
    throw error;
  }
}

/**
 * Preload multiple Lottie animations
 */
export async function preloadLottieAnimations(animationNames: string[]): Promise<Record<string, LottieAnimationData>> {
  const animations: Record<string, LottieAnimationData> = {};

  await Promise.allSettled(
    animationNames.map(async name => {
      try {
        animations[name] = await preloadLottieAnimation(name);
      } catch (error) {
        console.warn(`Failed to preload animation "${name}":`, error);
      }
    }),
  );

  return animations;
}

/**
 * Check if a Lottie animation file exists
 */
export async function checkLottieAnimationExists(animationName: string): Promise<boolean> {
  try {
    const response = await fetch(`/animations/${animationName}.json`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get animation duration in milliseconds
 */
export function getAnimationDuration(animationData: LottieAnimationData): number {
  if (!animationData || typeof animationData !== 'object') {
    return 0;
  }

  const { op: outPoint = 0, fr: frameRate = 30 } = animationData;
  return (outPoint / frameRate) * 1000;
}

/**
 * Get animation frame count
 */
export function getAnimationFrameCount(animationData: LottieAnimationData): number {
  if (!animationData || typeof animationData !== 'object') {
    return 0;
  }

  return animationData.op || 0;
}

/**
 * Common animation configurations
 */
export const LOTTIE_CONFIGS = {
  // Fast, attention-grabbing animations
  QUICK: {
    speed: 1.5,
    loop: false,
    autoplay: true,
  },

  // Slow, ambient animations
  AMBIENT: {
    speed: 0.5,
    loop: true,
    autoplay: true,
  },

  // One-time action animations
  ACTION: {
    speed: 1,
    loop: false,
    autoplay: true,
  },

  // Continuous loop animations
  CONTINUOUS: {
    speed: 1,
    loop: true,
    autoplay: true,
  },

  // Manual control animations
  MANUAL: {
    speed: 1,
    loop: false,
    autoplay: false,
  },
} as const;

/**
 * Create responsive animation sizes
 */
export function getResponsiveSize(baseSize: number) {
  return {
    sm: baseSize * 0.75,
    md: baseSize,
    lg: baseSize * 1.25,
    xl: baseSize * 1.5,
  };
}

/**
 * Animation easing functions
 */
export const LOTTIE_EASING = {
  easeInOut: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
} as const;
