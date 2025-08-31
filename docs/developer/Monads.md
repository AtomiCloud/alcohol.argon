# Using Monads

## Quick Start

All internal code MUST use monads instead of null/undefined/try-catch. Here's how:

### Replace null/undefined with Option

```typescript
import { Some, None, Opt } from '@/lib/monads/option';

// ❌ Old way
function getUser(id: string): User | null {
  return users.find(u => u.id === id) || null;
}

// ✅ New way
function getUser(id: string): Option<User> {
  const user = users.find(u => u.id === id);
  return user ? Some(user) : None;
}
```

### Replace try-catch with Result

```typescript
import { Ok, Err } from '@/lib/monads/result';

// ❌ Old way
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ✅ New way
async function fetchUser(id: string): Promise<Result<User, Error>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return Ok(user);
  } catch (error) {
    return Err(error);
  }
}
```

## Converting External APIs

Always convert external APIs at the boundary:

### Convert nullable values

```typescript
import { Opt } from '@/lib/monads/option';

// External API returns User | null | undefined
const externalUser = externalApi.getUser(id);
const safeUser = Opt.fromNative(externalUser); // Option<User>
```

### Convert promises

```typescript
// External promise that might throw
const result = await externalApi
  .fetchData()
  .then(Ok) // Success -> Ok(data)
  .catch(Err); // Error -> Err(error)
```

## Working with Option

### Basic operations

```typescript
const user = getUser('123'); // Option<User>

// Check if value exists
if (user.isSome()) {
  console.log(user.unwrap().name);
}

// Transform value
const userName = user.map(u => u.name.toUpperCase()).unwrapOr('Unknown');

// Chain operations
const email = user
  .map(u => u.email)
  .filter(email => email.includes('@'))
  .unwrapOr('No valid email');
```

### Multiple Options

```typescript
const user = getUser('123');
const profile = getProfile('123');

// Combine multiple Options
const combined = Opt.all([user, profile]).map(([u, p]) => ({ ...u, ...p }));
```

## Working with Result

### Basic operations

```typescript
const result = await fetchUser('123'); // Result<User, Error>

// Handle success/error
const userName = result.map(user => user.name).unwrapOr('Failed to load');

// Chain operations that can fail
const upperName = result
  .andThen(user => validateUser(user))
  .map(user => user.name.toUpperCase())
  .unwrapOr('Invalid user');
```

### Multiple Results

```typescript
const userResult = await fetchUser('123');
const settingsResult = await fetchSettings('123');

// Combine multiple Results - fails if any fail
const combined = Res.all([userResult, settingsResult]).map(([user, settings]) => ({ user, settings }));
```

## Common Patterns

### Form validation

```typescript
function validateEmail(email: string): Result<string, string> {
  if (!email.includes('@')) {
    return Err('Invalid email format');
  }
  return Ok(email);
}

function validateAge(age: number): Result<number, string> {
  if (age < 18) {
    return Err('Must be 18 or older');
  }
  return Ok(age);
}

// Combine validations
const emailResult = validateEmail(formData.email);
const ageResult = validateAge(formData.age);

const validUser = Res.all([emailResult, ageResult]).map(([email, age]) => ({ email, age }));

// Handle result
validUser.match({
  ok: user => console.log('Valid user:', user),
  err: errors => console.log('Validation errors:', errors),
});
```

### API calls with error handling

```typescript
async function loadUserData(id: string): Promise<Result<UserData, Problem>> {
  const userResult = await fetchUser(id);

  return userResult
    .andThen(async user => {
      const settingsResult = await fetchSettings(user.id);
      return settingsResult.map(settings => ({ user, settings }));
    })
    .mapErr(error => ({
      type: 'data_load_failed',
      title: 'Failed to Load User Data',
      status: 500,
      detail: error.message,
    }));
}

// Usage
const result = await loadUserData('123');
result.match({
  ok: data => setUserData(data),
  err: problem => setError(problem),
});
```

### React hooks

```typescript
function useUser(id: string) {
  const [user, setUser] = useState<Option<User>>(None);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(id)
      .then(result => {
        result.match({
          ok: user => setUser(Some(user)),
          err: error => {
            setUser(None);
            console.error('Failed to load user:', error);
          },
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  return {
    user: user.unwrapOr(null), // Convert back to nullable for React
    hasUser: user.isSome(),
    loading,
  };
}
```

## Network Serialization

### Sending over network

```typescript
const result = await fetchData();

// Convert to JSON-safe format
const serialized = result.serial();
// Send: { ok: true, data: {...} } or { ok: false, error: "..." }

fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(serialized),
});
```

### Receiving from network

```typescript
const response = await fetch('/api/endpoint');
const serialized = await response.json();

// Convert back to Result
const result = Res.fromSerial(serialized);
```

## Best Practices

### 1. Convert at boundaries

```typescript
// ✅ Convert external APIs immediately
const safeResult = await externalApi.getData().then(Ok).catch(Err);

// ❌ Don't mix native and monads
const data = await externalApi.getData(); // native
const result = processData(Some(data)); // mixed
```

### 2. Use appropriate monad

```typescript
// ✅ Option for values that might not exist
const user = findUser(id); // Option<User>

// ✅ Result for operations that might fail
const result = await saveUser(user); // Result<User, Error>
```

### 3. Chain operations

```typescript
// ✅ Chain operations together
const result = getUser(id)
  .andThen(validateUser)
  .map(user => user.email)
  .filter(email => email.includes('@'))
  .unwrapOr('No valid email');

// ❌ Don't unwrap early
const user = getUser(id).unwrap(); // Throws if None!
const email = user.email;
```

### 4. Handle all cases

```typescript
// ✅ Always handle both cases
result.match({
  ok: data => handleSuccess(data),
  err: error => handleError(error),
});

// ❌ Don't ignore errors
const data = result.unwrap(); // Throws if error!
```
