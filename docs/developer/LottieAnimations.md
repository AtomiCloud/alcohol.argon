# Lottie Animations

## Quick Usage

### Presets (Recommended)

```tsx
import { LoadingLottie, SuccessLottie, ErrorLottie, EmptyStateLottie } from '@/components/lottie';

<LoadingLottie size={32} />    // Loading spinner
<SuccessLottie size={48} />    // Success checkmark
<ErrorLottie size={48} />      // Error state
<EmptyStateLottie size={120} /> // Empty state
```

### Inline Component

```tsx
import animationData from '/public/animations/loading.json';
import { InlineLottie } from '@/components/lottie';

<InlineLottie animationData={animationData} width={48} height={48} />;
```

### Dynamic Component

```tsx
import { LottieAnimation } from '@/components/lottie';

<LottieAnimation animationName="custom-animation" width={200} height={200} />;
```

## When to Use What

- **Presets**: UI feedback (loading, success, error, empty states)
- **Inline**: Critical animations, small files (< 50KB), offline support
- **Dynamic**: Large illustrations (> 50KB), frequently changed animations

## Setup

1. **Add animations**: Place `.json` files in `/public/animations/`
2. **Get animations**: Download from [LottieFiles.com](https://lottiefiles.com/featured)
3. **Test setup**: Visit `/lottie-demo` page

## File Structure

```
animations/
├── loading.json     # Spinner (< 10KB, loops)
├── success.json     # Checkmark (< 20KB, no loop)
├── error.json       # X mark (< 20KB, no loop)
└── empty-state.json # Illustration (< 50KB, slow loop)
```

## Performance Guidelines

- **Simple icons**: < 10KB (use inline)
- **UI animations**: < 50KB (inline or dynamic)
- **Illustrations**: < 200KB (use dynamic)
- Monitor bundle size with many inline animations
