# Error Handling

## Quick Start

The project uses a unified error handling system with automatic reporting and user-friendly error pages.

### Report an Error

```typescript
import { useProblemReporter } from '@/adapters/problem-reporter/providers';

function MyComponent() {
  const problemReporter = useProblemReporter();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      problemReporter.pushError(error, {
        source: 'user-action',
        context: { action: 'submit-form' },
      });
    }
  };
}
```

### Show Error to User

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

## Error Types

### Application Errors (User-Facing)

Use ErrorContext for errors that should show the error page:

```typescript
const { setError } = useErrorContext();

setError({
  type: 'payment_failed',
  title: 'Payment Failed',
  status: 402,
  detail: 'Your payment method was declined. Please try a different card.',
});
```

### Background Errors (Reporting Only)

Use ProblemReporter for errors that shouldn't interrupt the user:

```typescript
const problemReporter = useProblemReporter();

problemReporter.pushError(error, {
  source: 'background-sync',
  context: { userId: user.id, operation: 'cache-refresh' },
});
```

## Using with Monads

### Option Errors

```typescript
import { useErrorContext } from '@/contexts/ErrorContext';

const { setError } = useErrorContext();

const user = getUser(id);
if (user.isNone()) {
  setError({
    type: 'user_not_found',
    title: 'User Not Found',
    status: 404,
    detail: `User with ID ${id} could not be found.`,
  });
  return;
}

// User found, continue...
const userData = user.unwrap();
```

### Result Errors

```typescript
const result = await fetchUserData(id);

result.match({
  ok: data => {
    setUserData(data);
  },
  err: error => {
    setError({
      type: 'data_load_failed',
      title: 'Failed to Load Data',
      status: 500,
      detail: 'Unable to load user data. Please try again.',
    });
  },
});
```

## Page-Level Errors

### In getServerSideProps

```typescript
export async function getServerSideProps(context) {
  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    return {
      props: {
        __error: {
          type: 'server_error',
          title: 'Server Error',
          status: 500,
          detail: 'Failed to load page data.',
        },
      },
    };
  }
}
```

### In API Routes

```typescript
import { ValidationError, EntityConflict } from '@/problems';

export default function handler(req, res) {
  try {
    if (!isValid(req.body)) {
      return ValidationError.send(res, {
        field: 'email',
        constraint: 'Invalid email format',
      });
    }

    if (userExists) {
      return EntityConflict.send(res, {
        TypeName: 'User',
        AssemblyQualifiedName: 'MyApp.Models.User',
      });
    }

    // Success response
    res.status(200).json({ success: true });
  } catch (error) {
    // Automatic error transformation
    const problem = problemTransformer.fromUnknown(error);
    res.status(problem.status).json(problem);
  }
}
```

## Error Recovery

### Manual Recovery

```typescript
const { clearError } = useErrorContext();

const handleRetry = () => {
  clearError(); // Clear error state
  // Retry the operation
  performAction();
};
```

### Automatic Recovery

Error pages include automatic refresh functionality:

```typescript
// Error page automatically provides refresh button
<ErrorPage
  error={error}
  onRefresh={() => {
    clearError();
    // Retry logic happens automatically
  }}
/>
```

## Custom Error Sources

### Form Validation

```typescript
const problemReporter = useProblemReporter();

const validateForm = data => {
  if (!data.email.includes('@')) {
    problemReporter.pushError(new Error('Invalid email'), {
      source: 'form-validation',
      context: {
        field: 'email',
        value: data.email,
        rule: 'email-format',
      },
    });
    return false;
  }
  return true;
};
```

### Network Errors

```typescript
const problemReporter = useProblemReporter();

const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    problemReporter.pushError(error, {
      source: 'network-request',
      context: {
        url: '/api/data',
        method: 'GET',
        timestamp: Date.now(),
      },
    });
    throw error;
  }
};
```

### User Actions

```typescript
const problemReporter = useProblemReporter();

const handleFileUpload = async file => {
  try {
    await uploadFile(file);
  } catch (error) {
    problemReporter.pushError(error, {
      source: 'file-upload',
      context: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  }
};
```

## Error Context Information

### User Context

```typescript
problemReporter.pushError(error, {
  source: 'checkout-process',
  context: {
    userId: user.id,
    userEmail: user.email,
    step: 'payment',
    amount: order.total,
  },
});
```

### System Context

```typescript
problemReporter.pushError(error, {
  source: 'system-error',
  context: {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: Date.now(),
    buildVersion: config.app.build.version,
  },
});
```

### Operation Context

```typescript
problemReporter.pushError(error, {
  source: 'data-processing',
  context: {
    operation: 'user-export',
    recordCount: records.length,
    format: 'csv',
    filters: appliedFilters,
  },
});
```

## React Patterns

### Error Boundaries

Error boundaries are automatically handled by AtomiProvider:

```typescript
// Automatic error boundary integration
<AtomiProvider>
  <MyApp />
</AtomiProvider>
```

### Hook Pattern

```typescript
function useAsyncOperation() {
  const { setError } = useErrorContext();
  const problemReporter = useProblemReporter();

  const performOperation = async data => {
    try {
      const result = await processData(data);
      return Ok(result);
    } catch (error) {
      // Report for tracking
      problemReporter.pushError(error, {
        source: 'async-operation',
        context: { operation: 'processData' },
      });

      // Show user-friendly error
      setError({
        type: 'operation_failed',
        title: 'Operation Failed',
        status: 500,
        detail: 'The operation could not be completed. Please try again.',
      });

      return Err(error);
    }
  };

  return { performOperation };
}
```

### Component Pattern

```typescript
function MyComponent() {
  const { setError } = useErrorContext();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await submitData(data);
      // Success handling
    } catch (error) {
      setError({
        type: 'submit_failed',
        title: 'Submission Failed',
        status: 400,
        detail: 'Your submission could not be processed. Please check your data and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
      <button disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Best Practices

### 1. Use Appropriate Error Channel

```typescript
// ✅ User-facing errors -> ErrorContext
setError(problem); // Shows error page

// ✅ Background errors -> ProblemReporter
problemReporter.pushError(error, { source: 'background' });

// ❌ Don't use console.error for important errors
console.error('Important error occurred'); // Lost in logs
```

### 2. Provide Context

```typescript
// ✅ Rich context for debugging
problemReporter.pushError(error, {
  source: 'user-action',
  context: {
    action: 'file-upload',
    fileName: file.name,
    fileSize: file.size,
    userId: user.id,
  },
});

// ❌ Minimal context
problemReporter.pushError(error, { source: 'error' });
```

### 3. User-Friendly Messages

```typescript
// ✅ Clear, actionable error messages
setError({
  type: 'validation_error',
  title: 'Invalid Email Address',
  status: 400,
  detail: 'Please enter a valid email address (example: user@domain.com)',
});

// ❌ Technical error messages
setError({
  type: 'error',
  title: 'Error',
  status: 500,
  detail: error.message, // Technical details
});
```

### 4. Handle All Error Cases

```typescript
// ✅ Handle both success and error
result.match({
  ok: data => handleSuccess(data),
  err: error => handleError(error),
});

// ❌ Only handle success
const data = result.unwrap(); // Throws on error
```
