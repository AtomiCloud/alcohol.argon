# Dark Mode

Simple theme system with light/dark/system modes.

## Usage

```tsx
// Toggle button (already in navbar)
import { ThemeToggle } from '@/components/ThemeToggle';

// Manual theme control
import { useTheme } from '@/lib/theme/provider';

const { theme, setTheme, systemTheme } = useTheme();
setTheme('dark'); // 'light' | 'dark' | 'system'
```

## How it works

- **CSS**: Complete dark mode variables in `globals.css` using `.dark` class
- **Provider**: `ThemeProvider` manages state + localStorage persistence
- **Toggle**: Cycles through Light → Dark → System → Light
- **Auto-detection**: Respects `prefers-color-scheme` for system mode

## Components

All existing components already use `dark:` Tailwind classes correctly.

## What was fixed

Your app had all the dark mode styles but was missing:

1. Theme state management
2. Toggle mechanism
3. Persistence

Now fully functional! 🌙
