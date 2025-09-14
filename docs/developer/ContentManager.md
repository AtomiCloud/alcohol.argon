# Content Manager

## Overview

The content management system handles application states:
loading, content, empty, and error. There are two approaches:

1. **Global Content System** - Uses page-level loading and empty states
   (full page re-renders)
2. **Free Content Manager** - Uses component-level loading and empty
   states (partial re-renders)

Both integrate with the monadic Result system and handle async data loading automatically.

## States

- **loading** - During async operations (with optional delay to prevent flicker)
- **content** - Normal page rendering with data
- **empty** - When content is empty or not found
- **error** - Handled through error context and boundary system

## Two Content Management Approaches

### Global Content System (Page-Level)

**When to use**: When loading/empty states should affect the entire page

```typescript
import { useContent } from '@/lib/content/providers';

function MyPage() {
  const [result, setResult] = useState<Result<User[], Problem>>(Ok([]));

  // No loader/empty provided = uses global page-level states
  const content = useContent(result, {
    notFound: 'No users found', // Message for global empty page
  });

  // When loading: entire page shows loading spinner
  // When empty: entire page shows empty state
  // When content: page shows this component
  return (
    <div>
      {content?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

### Free Content Manager (Component-Level)

**When to use**: When you want loading/empty states to only re-render a specific section

```typescript
import { useContent } from '@/lib/content/providers';
import { FreeContentManager } from '@/lib/content/components';
import { useFreeLoader, useFreeEmpty } from '@/lib/content/providers';

function MyComponent() {
  const [result, setResult] = useState<Result<User[], Problem>>(Ok([]));
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();

  // Custom loader/empty provided = uses component-level states
  const content = useContent(result, {
    notFound: 'No users found',
    loader,    // Prevents global loading page
    empty,     // Prevents global empty page
  });

  // Only this component re-renders for loading/empty states
  // Rest of the page remains unchanged
  return (
    <div>
      <h1>My Page Title</h1> {/* This stays visible during loading */}

      <FreeContentManager
        LoadingComponent={() => <div>Loading users...</div>}
        EmptyComponent={({ desc }) => <div>{desc}</div>}
        loadingState={loading}
        emptyState={desc}
      >
        {content?.map(user => <div key={user.id}>{user.name}</div>)}
      </FreeContentManager>

      <footer>Page Footer</footer> {/* This also stays visible */}
    </div>
  );
}
```

## Usage

## Key Difference: Re-render Behavior

### Global System (Full Page Re-render)

```typescript
// ❌ Without custom loader/empty = FULL PAGE re-renders
const content = useContent(result, {
  notFound: 'No data found',
  // No loader/empty provided
});

// During loading: Entire page shows loading spinner
// During empty: Entire page shows empty message
// User loses context of where they are in the app
```

### Free System (Partial Re-render)

```typescript
// ✅ With custom loader/empty = COMPONENT ONLY re-renders
const [loading, loader] = useFreeLoader();
const [desc, empty] = useFreeEmpty();

const content = useContent(result, {
  notFound: 'No data found',
  loader, // Prevents global loading page
  empty, // Prevents global empty page
});

// During loading: Only the FreeContentManager section shows loading
// During empty: Only the FreeContentManager section shows empty state
// Rest of page (headers, navigation, etc.) stays visible
```

## Complete Examples

### Global Content System Example

```typescript
import { useContent } from '@/lib/content/providers';
import { useState, useCallback } from 'react';
import { Ok, Err, type Result } from '@/lib/monads/result';

function MyPage() {
  const [result, setResult] = useState<Result<User[], Problem>>(Ok([]));

  // No custom loader/empty = uses global page states
  const content = useContent(result, {
    notFound: 'No users found',
    loaderDelay: 100, // Prevent flicker
  });

  const handleLoad = useCallback(async () => {
    // During this operation, ENTIRE PAGE shows loading
    const users = await fetchUsers();
    setResult(users);
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <button onClick={handleLoad}>Load Users</button>
      {content?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

### Free Content Manager Example

```typescript
import { useContent } from '@/lib/content/providers';
import { FreeContentManager } from '@/lib/content/components';
import { useFreeLoader, useFreeEmpty } from '@/lib/content/providers';
import { useState, useCallback } from 'react';

function MyPage() {
  const [result, setResult] = useState<Result<User[], Problem>>(Ok([]));
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();

  // Custom loader/empty = uses component-level states
  const content = useContent(result, {
    notFound: 'No users found',
    loader,  // Prevents global loading
    empty,   // Prevents global empty
    loaderDelay: 100,
  });

  const handleLoad = useCallback(async () => {
    loader.startLoading(); // Start component loading

    try {
      const users = await fetchUsers();
      setResult(users);
    } finally {
      loader.stopLoading(); // Stop component loading
    }
  }, [loader]);

  return (
    <div>
      <header>
        <h1>My Application</h1> {/* Stays visible during loading */}
        <nav>Navigation Menu</nav>
      </header>

      <main>
        <h2>Users Section</h2>
        <button onClick={handleLoad}>Load Users</button>

        {/* Only this section shows loading/empty states */}
        <FreeContentManager
          LoadingComponent={() => <div className="spinner">Loading users...</div>}
          EmptyComponent={({ desc }) => <div className="empty-state">{desc}</div>}
          loadingState={loading}
          emptyState={desc}
        >
          <div className="user-grid">
            {content?.map(user => (
              <div key={user.id} className="user-card">
                {user.name}
              </div>
            ))}
          </div>
        </FreeContentManager>
      </main>

      <footer>Footer content</footer> {/* Also stays visible */}
    </div>
  );
}
```

### Content with Error Handling

```typescript
// ⚠️ IMPORTANT: The `error` option REPLACES default error handling

// WITHOUT custom error handler - uses global error system (RECOMMENDED)
const content = useContent(results, {
  notFound: 'No results found',
  emptyChecker: content => Array.isArray(content) && content.length === 0,
  // No `error` provided = errors automatically trigger global error context
});

// WITH custom error handler - PREVENTS global error system
const content = useContent(results, {
  error: error => {
    // ⚠️ This REPLACES the global error handling!
    // Global error boundary will NOT be triggered
    console.error('Custom handling:', error);

    // You must handle the error completely here
    // If you want error reporting, call problemReporter.pushError() manually
  },
  notFound: 'No results found',
  emptyChecker: content => Array.isArray(content) && content.length === 0,
});

// RECOMMENDED: Let global system handle errors automatically
const fetchData = async () => {
  const result = await apiCall(); // Returns Result<Data[], Problem>

  // Just set the Result directly - don't try to handle errors here
  setResults(result); // Errors automatically handled by useContent -> global error system
};
```

### Content with Default Content (SSR)

```typescript
// For SSR, pass serialized Result as defaultContent
const content = useContent(results, {
  defaultContent: initialResults?.serial(), // ResultSerial from SSR props
  loaderDelay: 100, // Prevent initial loading flicker
  notFound: 'No items found',
});

// In getServerSideProps:
export const getServerSideProps = withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  const result = await apiTree.alcohol.zinc.vUserList({ version: '1.0' });

  return result.match({
    ok: users => ({
      props: {
        initialResults: Ok(users).serial(), // Serialize for client
      },
    }),
    err: problem => ({
      props: {
        initialResults: Err(problem).serial(),
      },
    }),
  });
});
```

## Advanced Usage

### Custom Loading Component

```typescript
<FreeContentManager
  LoadingComponent={MyCustomLoading}
  loadingState={loading}
>
  {content}
</FreeContentManager>
```

## Content Settings

```typescript
type ContentSetting<T, Y> = {
  defaultContent?: ResultSerial<T, Y>; // SSR content (serialized Result)
  emptyChecker?: (t: T) => boolean; // Custom empty detection logic
  loader?: ContentLoaderFn; // Custom loading state handler
  loaderDelay?: number; // Delay in ms before showing loader (prevents flicker)
  empty?: ContentEmptyFn; // Custom empty state handler
  error?: (u: unknown) => void; // Error handler (REPLACES global error system)
  notFound?: string; // Message shown in empty state
};
```

## State Flow

```
Loading → Content (with data)
Loading → Empty (no data found)
Loading → Error (failed to load)
```
