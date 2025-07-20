/**
 * Utility functions for working with Lottie animations
 */

// Type definitions for Lottie animation data
export interface LottieAnimationData {
  op?: number; // out point (frames)
  fr?: number; // frame rate
  [key: string]: unknown;
}
