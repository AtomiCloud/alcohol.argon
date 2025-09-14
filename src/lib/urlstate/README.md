# URL State Library

Bidirectional URL synchronization with component state, featuring debouncing, validation, and smart merging for responsive UIs and shareable URLs.

## Architecture

```
urlstate/
├── useUrlState.ts       # Basic URL parameter sync
├── useSearchState.ts    # Advanced search with validation/debouncing
└── util.ts              # Query manipulation utilities
```

## Core Hooks

### useUrlState - Basic URL parameter synchronization

```typescript
function useUrlState(
  paramName: string,
  initialValue = '',
  options: UrlStateOptions = {}
): [string, (newValue: string) => void]

interface UrlStateOptions {
  shallow?: boolean    // Shallow routing (default: true)
  replace?: boolean    // Replace vs push navigation (default: true)
}
```

**Usage**:
```typescript
function SearchInput() {
  const [query, setQuery] = useUrlState('q', '')
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
  // URL automatically updates: /page?q=search+term
}
```

### useSearchState - Advanced search with validation and debouncing

```typescript
function useSearchState<T extends Record<string, string>>(
  params: T,
  onSearch?: OnSearch<T>,
  options?: SearchStateOptions<T>
): SearchStateReturn<T>

interface SearchStateOptions<T> {
  debounceMs?: number                              // Debounce delay for URL sync
  validators?: Partial<SearchStateValidators<T>>   // Input validators
}

type SearchStateReturn<T> = {
  query: T                           // Current local query state
  setQuery: (newQuery: Partial<T>) => void        // Update query parameters
  clearSearch: () => void            // Clear all search parameters
}
```

**Usage**:
```typescript
function ProductSearch() {
  const [products, setProducts] = useState([])

  const { query, setQuery, clearSearch } = useSearchState(
    { q: '', category: 'all', minPrice: '' },
    async (searchParams) => {
      const results = await searchProducts(searchParams)
      setProducts(results)
    },
    {
      debounceMs: 300,
      validators: {
        minPrice: (value) => !value || /^\d+$/.test(value),
        category: (value) => ['all', 'electronics', 'books'].includes(value)
      }
    }
  )

  return (
    <div>
      <input
        value={query.q}
        onChange={(e) => setQuery({ q: e.target.value })}
      />
      <select
        value={query.category}
        onChange={(e) => setQuery({ category: e.target.value })}
      >
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
      </select>
      <button onClick={clearSearch}>Clear</button>
    </div>
  )
}
```

## Smart Synchronization

**Local-to-URL Flow**:
1. User input → immediate local state update
2. Input validation → only valid data proceeds
3. Debouncing → prevents excessive URL updates
4. URL update → triggers search execution

**URL-to-Local Flow**:
1. URL changes (navigation/direct links)
2. Parameter parsing + default merging
3. Local state update (if not internally modified)
4. Search trigger with new URL state

## Validation System

Validators ensure only valid data reaches URLs:

```typescript
const validators = {
  email: (value) => !value || /\S+@\S+\.\S+/.test(value),
  age: (value) => !value || (Number(value) >= 0 && Number(value) <= 120),
  category: (value) => validCategories.includes(value)
}

// Invalid inputs stay local until corrected
setQuery({ email: 'invalid-email' })  // Local only
setQuery({ email: 'valid@email.com' }) // Local + URL
```

## Debouncing Strategy

```typescript
const { query, setQuery } = useSearchState(searchParams, handleSearch, { debounceMs: 300 })

// Rapid typing:
setQuery({ q: 'a' })      // Local: 'a', URL: unchanged
setQuery({ q: 'ap' })     // Local: 'ap', URL: unchanged
setQuery({ q: 'app' })    // Local: 'app', URL: unchanged
// After 300ms: URL updates to ?q=app, search executes
```

## Utility Functions

```typescript
// Merge URL query with defaults
function mergeQueryWithDefaults<T extends Record<string, string>>(
  urlQuery: Record<string, string | string[]>,
  defaults: T
): T

// Compare query objects for equality
function queryEqual<T extends Record<string, string>>(a: T, b: T): boolean

// Create wrapped reference for change tracking
function useRefWrap<T>(value: T): RefObject<T>
```

### SSR Support
```typescript
export async function getServerSideProps(context) {
  const searchResults = await searchAPI(context.query)
  return { props: { initialResults: searchResults, initialQuery: context.query } }
}

function SearchPage({ initialResults, initialQuery }) {
  const [results, setResults] = useState(initialResults)
  const { query, setQuery } = useSearchState(initialQuery, async (params) => {
    const newResults = await searchAPI(params)
    setResults(newResults)
  })
  return <SearchInterface query={query} onQueryChange={setQuery} results={results} />
}
```
