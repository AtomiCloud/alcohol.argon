'use client';

import { useRef, useState } from 'react';
import type { LottieRef } from 'lottie-react';

interface UseLottieOptions {
  /**
   * Auto play animation on mount
   */
  autoplay?: boolean;
  /**
   * Loop the animation
   */
  loop?: boolean;
  /**
   * Animation speed (1 = normal, 2 = 2x speed, 0.5 = half speed)
   */
  speed?: number;
}

interface UseLottieReturn {
  /**
   * Ref to attach to Lottie component
   */
  lottieRef: React.RefObject<LottieRef | null>;
  /**
   * Current animation state
   */
  isPlaying: boolean;
  /**
   * Set playing state
   */
  setIsPlaying: (playing: boolean) => void;
}

export function useLottie(options: UseLottieOptions = {}): UseLottieReturn {
  const { autoplay = false } = options;

  const lottieRef = useRef<LottieRef>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  return {
    lottieRef,
    isPlaying,
    setIsPlaying,
  };
}
