# Alcohol.Argon Frontend

Next.js 15 application with TypeScript, featuring search functionality and Lottie animations.

## Features

- **Search System**: Full-text search with SSR support and live search
- **Lottie Animations**: Comprehensive animation system with inline and dynamic loading
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Performance**: Optimized for Cloudflare deployment with OpenNext

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── lottie/          # Lottie animation system
│   │   ├── ui/              # shadcn/ui components
│   │   └── SearchResults.tsx
│   ├── pages/
│   │   ├── search.tsx       # Search page with SSR
│   │   └── lottie-demo.tsx  # Animation examples
│   ├── lib/
│   │   └── lottie-utils.ts  # Animation utilities
│   └── hooks/
│       └── useLottie.ts     # Animation control hook
├── public/
│   └── animations/          # Lottie JSON files
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd alcohol.argon

# Install dependencies
bun install

# Start development server
bun dev
```

### Development

```bash
# Type checking
bun run type-check

# Build for production
bun run build
```

## Lottie Animation System

This project includes a comprehensive Lottie animation system with both inline and dynamic loading capabilities.

### Quick Start

**Option 1: Immediate Usage (CSS/SVG Fallbacks)**
```tsx
import { LoadingLottie, SuccessLottie } from '@/components/lottie';

<LoadingLottie size={32} />     // Works immediately
<SuccessLottie size={48} />     // CSS spinner & SVG icons
```

**Option 2: Inline Lottie Animations**
```tsx
import animationData from '/public/animations/loading.json';
import { InlineLottie } from '@/components/lottie';

<InlineLottie animationData={animationData} width={48} height={48} />
```

**Option 3: Dynamic Loading**
```tsx
import { LottieAnimation } from '@/components/lottie';

<LottieAnimation animationName="loading" width={48} height={48} />
```

### Animation Setup

1. **Get Animations**: Download from [LottieFiles.com](https://lottiefiles.com/featured)
2. **Add Files**: Place JSON files in `/public/animations/`
3. **Use Components**: Import and use in your React components

### Components Available

- `InlineLottie` - Zero loading states, immediate display
- `LottieAnimation` - Hybrid component with fallback support
- `LoadingLottie` - Loading spinner preset
- `SuccessLottie` - Success checkmark preset
- `ErrorLottie` - Error state preset
- `EmptyStateLottie` - Empty state illustration preset

### Demo & Documentation

Visit `/lottie-demo` to see:
- Live examples of all components
- Code snippets and usage patterns
- Setup instructions and best practices
- Performance guidelines

## Search System

Full-featured search system with:
- Server-side rendering (SSR)
- Live search with debouncing
- URL query parameter synchronization
- Loading states and error handling

Visit `/search` to try it out.

## Development Guidelines

### Code Quality
- ESLint + TypeScript for code quality
- Prettier for code formatting
- Pre-commit hooks for validation

### Performance
- Bundle size monitoring
- Image optimization
- Animation file size guidelines (< 100KB)

### Deployment
- Optimized for Cloudflare with OpenNext
- SSR support for better SEO
- Static asset optimization

## Documentation

- **LLM.MD** - Technical architecture and decisions
- **TODO.md** - Project status and completed features
- **public/animations/README.md** - Complete Lottie setup guide
- **Changelog.md** - Version history

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Lottie with lottie-react
- **Deployment**: Cloudflare with OpenNext
- **Package Manager**: Bun
- **Build Tools**: Next.js built-in tooling

## Contributing

1. Check TODO.md for current tasks
2. Follow the existing code patterns
3. Add tests for new features
4. Update documentation as needed

## License

[Add your license information here] 