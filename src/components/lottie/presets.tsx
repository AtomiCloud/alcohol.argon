import InlineLottie from './InlineLottie';

// Import animation data - uncomment when you have the JSON files
import loadingData from '/public/animations/loading.json';
import successData from '/public/animations/success.json';
import errorData from '/public/animations/errors/dogSwimming.json';
import emptyStateData from '/public/animations/empty-state.json';
import type { LottieAnimationData } from '@/lib/lottie-utils';

interface PresetProps {
  className?: string;
  size?: number;
}

interface ResponsivePresetProps {
  className?: string;
  responsive?: boolean;
}

interface BaseProps {
  loop: boolean;
  autoplay: boolean;
  animationData: LottieAnimationData;
}

export function ResponsiveLottie({
  animationData,
  className,
  size,
  loop,
  autoplay,
}: PresetProps & ResponsivePresetProps & BaseProps) {
  if (size) {
    return (
      <InlineLottie
        animationData={animationData}
        className={className}
        width={size}
        height={size}
        loop={loop}
        autoplay={autoplay}
      />
    );
  }

  // Responsive sizing - 90% of screen width, max 400px
  return (
    <div className={`w-[90%] max-w-[400px] aspect-square ${className || ''}`}>
      <InlineLottie animationData={animationData} width="100%" height="100%" loop={loop} autoplay={autoplay} />
    </div>
  );
}

/**
 * Loading spinner animation preset (inline)
 * Supports both fixed size and responsive sizing
 */
export function LoadingLottie({ className, size }: PresetProps & ResponsivePresetProps) {
  return ResponsiveLottie({
    animationData: loadingData,
    className,
    size,
    loop: true,
    autoplay: true,
  });
}

/**
 * Success checkmark animation preset (inline)
 * To use: uncomment the import above and enable the InlineLottie component below
 */
export function SuccessLottie({ className, size }: PresetProps) {
  return ResponsiveLottie({
    animationData: successData,
    className,
    size,
    loop: false,
    autoplay: true,
  });
}

/**
 * Error animation preset (inline)
 * To use: uncomment the import above and enable the InlineLottie component below
 */
export function ErrorLottie({ className, size }: PresetProps) {
  return ResponsiveLottie({
    animationData: errorData,
    className,
    size,
    loop: false,
    autoplay: true,
  });
}

/**
 * Empty state animation preset (inline)
 * To use: uncomment the import above and enable the InlineLottie component below
 */
export function EmptyStateLottie({ className, size }: PresetProps) {
  return ResponsiveLottie({
    animationData: emptyStateData,
    className,
    size,
    loop: true,
    autoplay: true,
  });
}
