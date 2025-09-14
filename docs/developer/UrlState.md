# URL State Management

## Overview

URL state synchronization system for maintaining application state in the browser URL. Enables bookmarking, sharing, and navigation while keeping UI state synchronized.

**Key Features:**

- Automatic URL synchronization
- SSR-safe initialization
- Smart loading states for search
- Debounced URL updates
- Validation support

## How to Use URL State

### Basic URL State

```typescript
import { useUrlState } from '@/lib/urlstate/useUrlState';

function MyComponent() {
  const [query, setQuery] = useUrlState('q', '');

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <p>Current search: {query}</p>
    </div>
  );
}
```

### Search with Auto-Execute

```typescript
import { useSearchState } from '@/lib/urlstate/useSearchState';
import { useState } from 'react';

function SearchComponent() {
  const [results, setResults] = useState([]);

  const { query, setQuery, clearSearch } = useSearchState(
    { q: '', category: 'all' }, // Default values
    async (searchParams) => {
      // This function runs when URL changes
      if (searchParams.q) {
        const data = await searchAPI(searchParams.q, searchParams.category);
        setResults(data);
      } else {
        setResults([]);
      }
    }
  );

  return (
    <div>
      <input
        value={query.q}
        onChange={(e) => setQuery({ q: e.target.value })}
        placeholder="Search..."
      />
      <select
        value={query.category}
        onChange={(e) => setQuery({ category: e.target.value })}
      >
        <option value="all">All Categories</option>
        <option value="users">Users</option>
        <option value="posts">Posts</option>
      </select>

      <button onClick={clearSearch}>Clear</button>

      <div>
        {results.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
```

## Advanced Search Features

### Debounced URL Updates

```typescript
const { query, setQuery } = useSearchState(
  { q: '', filter: '' },
  async params => {
    const results = await searchAPI(params.q, params.filter);
    setResults(results);
  },
  {
    debounceMs: 300, // Wait 300ms before updating URL
  },
);

// User typing doesn't immediately update URL
// URL updates only after user stops typing for 300ms
```

### Input Validation

```typescript
const { query, setQuery } = useSearchState(
  { page: '1', limit: '10' },
  async params => {
    const results = await fetchPagedData(parseInt(params.page), parseInt(params.limit));
    setResults(results);
  },
  {
    validators: {
      page: value => /^\d+$/.test(value) && parseInt(value) > 0,
      limit: value => /^\d+$/.test(value) && parseInt(value) <= 100,
    },
  },
);

// Invalid values stay in local state until fixed
// Only valid values sync to URL and trigger searches
```

## Integration with Content System

```typescript
import { useSearchState } from '@/lib/urlstate/useSearchState';
import { useContent } from '@/lib/content/providers';
import { useFreeLoader, useFreeEmpty } from '@/lib/content/providers';
import { useState } from 'react';

function SearchPage() {
  const [result, setResult] = useState(Ok([]));
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();

  const { query, setQuery, clearSearch } = useSearchState(
    { q: '', category: 'all' },
    async (params) => {
      if (!params.q.trim()) {
        setResult(Ok([]));
        return;
      }

      loader.startLoading();
      try {
        const searchResult = await apiTree.search.query(params);
        setResult(searchResult);
      } finally {
        loader.stopLoading();
      }
    },
    { debounceMs: 300 }
  );

  const content = useContent(result, {
    notFound: 'No search results found',
    loader,
    empty,
  });

  return (
    <FreeContentManager
      LoadingComponent={() => <div>Searching...</div>}
      EmptyComponent={({ desc }) => <div>{desc}</div>}
      loadingState={loading}
      emptyState={desc}
    >
      <SearchForm query={query} setQuery={setQuery} onClear={clearSearch} />
      <SearchResults results={content} />
    </FreeContentManager>
  );
}
```

## URL State Options

### useUrlState Options

```typescript
type UrlStateOptions = {
  shallow?: boolean; // Default: true (don't trigger getServerSideProps)
  replace?: boolean; // Default: true (replace history instead of push)
};

const [value, setValue] = useUrlState('param', 'default', {
  shallow: false, // Will trigger getServerSideProps
  replace: false, // Will add to browser history
});
```

### useSearchState Options

```typescript
type SearchStateOptions = {
  debounceMs?: number; // Default: 0 (no debouncing)
  validators?: Partial<Record<string, (value: string) => boolean>>;
};

const { query, setQuery } = useSearchState(defaultParams, onSearch, {
  debounceMs: 500,
  validators: {
    email: value => value.includes('@'),
    age: value => parseInt(value) >= 0,
  },
});
```

## SSR Integration

### Server-Side Props with URL State

```typescript
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

export const getServerSideProps = withServerSideAtomi(buildTime, async (context, { apiTree }) => {
  const query = (context.query.q as string) || '';
  const category = (context.query.category as string) || 'all';

  if (query) {
    const result = await apiTree.search.query({ q: query, category });

    return result.match({
      ok: data => ({
        props: {
          initialResults: Ok(data).serial(),
          initialQuery: { q: query, category },
        },
      }),
      err: problem => ({
        props: {
          error: problem,
          initialQuery: { q: query, category },
        },
      }),
    });
  }

  return {
    props: {
      initialResults: Ok([]).serial(),
      initialQuery: { q: '', category: 'all' },
    },
  };
});
```

### Using SSR Data

```typescript
function SearchPage({ initialResults, initialQuery }) {
  const [result, setResult] = useState(() =>
    initialResults ? Res.fromSerial(initialResults) : Ok([])
  );

  const { query, setQuery } = useSearchState(
    initialQuery,
    async (params) => {
      // This won't run on initial load if URL matches initialQuery
      const searchResult = await apiTree.search.query(params);
      setResult(searchResult);
    }
  );

  // Content system handles both SSR data and subsequent searches
  const content = useContent(result, {
    defaultContent: initialResults, // SSR data
    notFound: 'No results found',
  });

  return (
    <div>
      <SearchForm query={query} setQuery={setQuery} />
      <SearchResults results={content} />
    </div>
  );
}
```

## Common Patterns

### Multi-Parameter Search

```typescript
const { query, setQuery, clearSearch } = useSearchState({
  q: '', // Search term
  category: 'all', // Filter category
  sort: 'name', // Sort order
  page: '1', // Pagination
});

// Update single parameter
const handleSearch = term => setQuery({ q: term });
const handleFilter = cat => setQuery({ category: cat });
const handleSort = order => setQuery({ sort: order });

// Update multiple parameters at once
const handlePageChange = newPage =>
  setQuery({
    page: newPage.toString(),
    q: query.q, // Keep existing search
  });
```

### Form Integration

```typescript
function FilterForm() {
  const { query, setQuery } = useSearchState({
    name: '',
    email: '',
    status: 'active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    setQuery({
      name: formData.get('name'),
      email: formData.get('email'),
      status: formData.get('status'),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" defaultValue={query.name} placeholder="Name" />
      <input name="email" defaultValue={query.email} placeholder="Email" />
      <select name="status" defaultValue={query.status}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button type="submit">Filter</button>
    </form>
  );
}
```

## Best Practices

### 1. Use Appropriate Hook

```typescript
// ✅ Single parameter, simple sync
const [search, setSearch] = useUrlState('q', '');

// ✅ Multiple parameters with search logic
const { query, setQuery } = useSearchState({ q: '', filter: '' }, onSearch);
```

### 2. Provide Meaningful Defaults

```typescript
// ✅ Clear default values
const { query, setQuery } = useSearchState({
  q: '', // Empty search
  category: 'all', // Show all categories
  page: '1', // First page
  limit: '20', // Reasonable page size
});

// ❌ Unclear defaults
const { query, setQuery } = useSearchState({ a: '', b: '', c: '' });
```

### 3. Use Validation for Data Integrity

```typescript
// ✅ Validate numeric and constrained values
const { query, setQuery } = useSearchState({ page: '1', limit: '20' }, onSearch, {
  validators: {
    page: value => /^\d+$/.test(value) && parseInt(value) > 0,
    limit: value => ['10', '20', '50', '100'].includes(value),
  },
});
```

### 4. Debounce User Input

```typescript
// ✅ Debounce search input to avoid excessive API calls
const { query, setQuery } = useSearchState({ q: '' }, onSearch, { debounceMs: 300 });
```

### 5. Handle Empty States

```typescript
const { query, setQuery } = useSearchState({ q: '' }, async params => {
  if (!params.q.trim()) {
    setResults([]); // Clear results for empty search
    return;
  }

  const results = await searchAPI(params.q);
  setResults(results);
});
```

The URL state system provides powerful synchronization between UI state and browser URL, enabling shareable, bookmarkable application states while maintaining excellent user experience.
