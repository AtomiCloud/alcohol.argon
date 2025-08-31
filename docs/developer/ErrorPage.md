# Error Page System

## Overview

Enhanced error page component with status-specific animations, JSON export functionality, and refresh capabilities.

## Features

- Status-specific Lottie animations (400, 401, 403, 404, 500, etc.)
- JSON error details export for support
- Refresh functionality
- Responsive design
- Copy to clipboard

## Usage

### Automatic Integration

ErrorPage is automatically used by ContentManager and GlobalErrorBoundary:

```typescript
// No setup required - handled by AtomiProvider
<GlobalErrorBoundary ErrorComponent={ErrorPage}>
  <ContentManager />
</GlobalErrorBoundary>
```

### Manual Usage

```typescript
import { ErrorPage } from '@/components/error-page';

function MyComponent() {
  const error = {
    type: 'validation_error',
    title: 'Invalid Input',
    status: 400,
    detail: 'Please check your input and try again.'
  };

  return (
    <ErrorPage
      error={error}
      onRefresh={() => window.location.reload()}
    />
  );
}
```

## Error Animations

Status-specific animations with fallback names:

```typescript
import { getAnimationForStatus } from '@/components/lottie/ErrorAnimations';

const animationInfo = getAnimationForStatus(404);
// Returns: { animation: 'not-found', cheekyName: 'Oops! Page Not Found' }

const animationInfo = getAnimationForStatus(500);
// Returns: { animation: 'server-error', cheekyName: 'Something Went Wrong' }
```

## Problem Integration

Works with RFC 7807 Problem Details:

```typescript
interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  [key: string]: any;
}
```

## Error Page Features

### JSON Export

Users can expand error details and copy JSON for support:

```typescript
const handleCopyJson = async () => {
  const jsonString = JSON.stringify(error, null, 2);
  await navigator.clipboard.writeText(jsonString);
};
```

### Refresh Functionality

```typescript
const handleRefresh = () => {
  if (onRefresh) {
    onRefresh(); // Custom refresh logic
  } else {
    window.location.reload(); // Default browser refresh
  }
};
```

### Animation Selection

Animations selected based on HTTP status:

- **400-499**: Client error animations (user-facing)
- **500-599**: Server error animations (technical)
- **404**: Specific "not found" animation
- **403**: Specific "unauthorized" animation

## Component Props

```typescript
interface ErrorComponentProps {
  error: Problem;
  onRefresh?: () => void;
}
```

## Styling

Uses Tailwind CSS with responsive design:

- Mobile-first approach
- Dark mode support
- Accessible color contrast
- Interactive elements with proper hover states

## Integration with Error Context

```typescript
import { useErrorContext } from '@/contexts/ErrorContext';

function MyComponent() {
  const { setError } = useErrorContext();

  // Trigger ErrorPage display
  setError({
    type: 'custom_error',
    title: 'Custom Error',
    status: 422,
    detail: 'Custom error message',
  });
}
```
