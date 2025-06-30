# Lottie Animations Setup Guide

This directory contains all Lottie animation files (.json) used in the application.

## 🚀 Quick Setup (Choose Your Approach)

### Option 1: Inline Animations (Recommended)
Perfect for loading states, success feedback, and critical animations.

**Step 1:** Download your animation
- Visit [LottieFiles.com](https://lottiefiles.com/featured)
- Download as JSON file (e.g., `loading.json`)
- Place in `/public/animations/`

**Step 2:** Import and use directly
```tsx
import animationData from '/public/animations/loading.json';
import { InlineLottie } from '@/components/lottie';

<InlineLottie 
  animationData={animationData} 
  width={48} 
  height={48} 
/>
```

**Step 3:** Or use presets (after setup)
```tsx
// 1. Uncomment imports in src/components/lottie/presets.tsx
// 2. Uncomment the InlineLottie components
// 3. Use the presets:

import { LoadingLottie } from '@/components/lottie';
<LoadingLottie size={48} />
```

### Option 2: Dynamic Animations
Good for large illustrations, hero animations, or when you need to swap animations easily.

**Step 1:** Add animation file
- Download animation as JSON
- Place in `/public/animations/` (e.g., `hero-animation.json`)

**Step 2:** Use with animationName
```tsx
import { LottieAnimation } from '@/components/lottie';

<LottieAnimation 
  animationName="hero-animation"
  width={200} 
  height={200} 
/>
```

## 📁 Directory Structure

```
animations/
├── README.md              # This guide
├── sample-animations.md   # Where to find animations
├── loading.json          # Loading spinner (for presets)
├── success.json          # Success checkmark (for presets)
├── error.json            # Error indication (for presets)
├── empty-state.json      # Empty state (for presets)
└── custom/               # Your custom animations
    ├── hero-animation.json
    └── feature-demo.json
```

## 🛠️ Setting Up Presets (Recommended)

The preset components (LoadingLottie, SuccessLottie, etc.) are designed to work with specific animation files. Here's how to set them up:

### Step 1: Download Required Animations

Visit [LottieFiles.com](https://lottiefiles.com/featured) and search for:

1. **Loading Animation** → Save as `loading.json`
   - Search: "loading spinner", "dots loading" 
   - Should loop seamlessly
   - Keep under 10KB

2. **Success Animation** → Save as `success.json`
   - Search: "success checkmark", "check animation"
   - Should play once (no loop)
   - Keep under 20KB

3. **Error Animation** → Save as `error.json`
   - Search: "error cross", "x mark animation"
   - Should play once (no loop)
   - Keep under 20KB

4. **Empty State Animation** → Save as `empty-state.json`
   - Search: "empty state", "no data", "empty box"
   - Can loop slowly
   - Keep under 50KB

### Step 2: Enable Presets

Edit `src/components/lottie/presets.tsx`:

```tsx
// Uncomment these imports at the top:
import loadingData from '/public/animations/loading.json';
import successData from '/public/animations/success.json';
import errorData from '/public/animations/error.json';
import emptyStateData from '/public/animations/empty-state.json';

// Then uncomment the InlineLottie components in each preset function
```

### Step 3: Use Presets Everywhere

```tsx
import { LoadingLottie, SuccessLottie, ErrorLottie, EmptyStateLottie } from '@/components/lottie';

// In loading states
<LoadingLottie size={32} />

// In success feedback
<SuccessLottie size={48} />

// In error states  
<ErrorLottie size={48} />

// In empty states
<EmptyStateLottie size={120} />
```

## 🎯 When to Use Each Approach

### Use Inline for:
- ✅ Loading animations (avoid "loading the loader")
- ✅ Success/error feedback (immediate response)
- ✅ Small UI animations (< 50KB)
- ✅ Critical path animations
- ✅ Animations that should work offline

### Use Dynamic for:
- ✅ Large illustrations (> 50KB)
- ✅ Hero animations
- ✅ Animations you might swap frequently
- ✅ Non-critical decorative animations

## 🔧 Component Examples

### Basic Inline Usage
```tsx
import animationData from '/public/animations/my-animation.json';
import { InlineLottie } from '@/components/lottie';

<InlineLottie 
  animationData={animationData}
  width={100}
  height={100}
  loop={true}
  autoplay={true}
/>
```

### Basic Dynamic Usage
```tsx
import { LottieAnimation } from '@/components/lottie';

<LottieAnimation 
  animationName="my-animation"
  width={100}
  height={100}
  showLoader={true}  // Shows loading spinner
/>
```

### Hybrid Approach (Best of Both)
```tsx
import fallbackData from '/public/animations/loading.json';
import { LottieAnimation } from '@/components/lottie';

<LottieAnimation 
  animationData={fallbackData}     // Inline fallback
  animationName="custom-loading"   // Try dynamic first
  width={48}
  height={48}
/>
```

## 🚀 Real-World Usage Examples

### Loading Button
```tsx
import loadingData from '/public/animations/loading.json';
import { InlineLottie } from '@/components/lottie';

const [isLoading, setIsLoading] = useState(false);

<Button disabled={isLoading}>
  {isLoading ? (
    <InlineLottie animationData={loadingData} width={20} height={20} />
  ) : (
    'Submit'
  )}
</Button>
```

### Success Message
```tsx
import { SuccessLottie } from '@/components/lottie';

{showSuccess && (
  <div className="flex items-center gap-2">
    <SuccessLottie size={24} />
    <span>Success!</span>
  </div>
)}
```

### Empty State
```tsx
import { EmptyStateLottie } from '@/components/lottie';

{items.length === 0 && (
  <div className="text-center py-8">
    <EmptyStateLottie size={120} />
    <h3>No items found</h3>
    <p>Try adjusting your search</p>
  </div>
)}
```

## 📊 File Size Guidelines

- **Simple icons**: < 10KB (inline recommended)
- **UI animations**: < 50KB (inline or dynamic)
- **Illustrations**: < 100KB (dynamic recommended)
- **Hero animations**: < 200KB (dynamic with lazy loading)

## 🎨 Animation Recommendations

### For Loading States
- Simple spinner or dots
- 2-3 second duration
- Seamless loop
- Minimal complexity

### For Success/Error States
- Clear visual feedback
- 1-2 second duration
- No loop (one-time play)
- Recognizable icons

### For Empty States
- Friendly illustration
- Subtle animation
- Can loop slowly
- Matches your brand

## 🔍 Testing Your Setup

1. **Visit `/lottie-demo`** to see examples and test your animations
2. **Check the browser console** for any loading errors
3. **Test on mobile devices** to ensure good performance
4. **Monitor bundle size** if using many inline animations

## 🛠️ Troubleshooting

### Inline Issues
- **Import errors**: Check file path and JSON validity
- **Bundle size**: Use dynamic loading for large files
- **TypeScript errors**: Ensure `src/types/json.d.ts` exists

### Dynamic Issues  
- **Animation not loading**: Verify file exists in `/public/animations/`
- **Loading states**: Set `showLoader={true}` for better UX
- **Network errors**: Consider inline approach for critical animations

Your setup supports both approaches - choose the right one for each use case! 🎊 