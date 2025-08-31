# Content Manager

## Overview

ContentManager manages three application states: loading, content,
and error. It handles navigation transitions, error recovery, and
integrates with the problem reporting system.

## States

- **loading** - During navigation or async operations
- **content** - Normal page rendering
- **error** - Error page with recovery options

## Integration

Automatically integrated through AtomiProvider:

```typescript
<AtomiProvider>
  <Layout>
    <Component {...pageProps} />
  </Layout>
</AtomiProvider>
```

## Usage

### Error State

**Context Errors:**

```typescript
import { useErrorContext } from '@/contexts/ErrorContext';

function MyComponent() {
  const { setError } = useErrorContext();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      setError({
        type: 'user_action_failed',
        title: 'Action Failed',
        status: 400,
        detail: 'The requested action could not be completed.',
      });
    }
  };
}
```

**Page-Level Errors:**

```typescript
export async function getServerSideProps(context) {
  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    return {
      props: {
        __error: {
          type: 'data_fetch_failed',
          title: 'Data Loading Failed',
          status: 500,
          detail: error.message,
        },
      },
    };
  }
}
```

### Error Recovery

```typescript
const { clearError } = useErrorContext();

const handleRetry = () => {
  clearError(); // Returns to content state
  // Retry logic
};
```

### Loading States

```typescript
// Navigation loading - automatic
router.push('/new-page');

// Component loading - manual
const [isSubmitting, setIsSubmitting] = useState(false);
```

## Error Reporting

Navigation errors automatically reported:

```typescript
const handleRouteChangeError = (err: Error) => {
  const problem = {
    type: 'navigation_error',
    title: 'Navigation Error',
    status: 500,
    detail: err.message,
  };

  problemReporter.pushError(err, { source: 'navigation-error', problem });
};
```

## State Flow

```
Navigation → loading → content
Navigation → loading → error → refresh → content
Component Error → error → refresh → content
```
