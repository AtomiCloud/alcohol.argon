'use client';

import Lottie, { type LottieComponentProps } from 'lottie-react';
import { cn } from '@/lib/utils';
import type { LottieAnimationData } from '@/lib/lottie-utils';

interface InlineLottieProps extends LottieComponentProps {
  /**
   * Animation data object (required)
   * Import your JSON: import loadingAnimation from '/public/animations/loading.json'
   */
  animationData: LottieAnimationData;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Width of the animation container
   */
  width?: number | string;
  /**
   * Height of the animation container
   */
  height?: number | string;
}

/**
 * Simple inline Lottie component with no loading states
 * Perfect for loading animations where you want immediate display
 */
export default function InlineLottie({
  animationData,
  className,
  width = '100%',
  height = '100%',
  loop = true,
  autoplay = true,
  ...lottieProps
}: InlineLottieProps) {
  const containerStyle = {
    width,
    height,
  };

  return (
    <div className={cn('', className)} style={containerStyle}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
        {...lottieProps}
      />
    </div>
  );
}
