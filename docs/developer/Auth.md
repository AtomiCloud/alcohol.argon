# Authentication System

## Overview

Type-safe authentication system built on Logto with Result monad integration,
discriminated unions for auth state, and full SSR/CSR compatibility.
Provides seamless authentication flows with automatic token management and
functional programming patterns.

## How to Use Authentication

### Basic Authentication Check

```typescript
import { useClaims } from '@/lib/auth/providers';

function MyComponent() {
  const [result, content] = useClaims();

  if (result === 'err') return <div>Authentication error</div>;

  const [hasData, authState] = content;
  if (!hasData) return <div>Loading...</div>;

  if (authState.__kind === 'authed') {
    const claims = authState.value.data;
    return <div>Welcome {claims.username}!</div>;
  } else {
    return (
      <button onClick={() => window.location.assign('/api/logto/sign-in')}>
        Sign In
      </button>
    );
  }
}
```

### Available Hooks

```typescript
import { useClaims, useUserInfo, useTokens } from '@/lib/auth/providers';

// Get ID token claims (username, email, etc.)
const claims = useClaims();

// Get detailed user profile information
const userInfo = useUserInfo();

// Get access tokens for API calls
const tokens = useTokens();
```

### Pre-built Components

```typescript
import { AuthSection } from '@/components/AuthSection';

<AuthSection /> // Shows sign-in button or user profile dropdown
```

## Server-Side Authentication

### Protected Pages

```typescript
export const getServerSideProps = withServerSideAtomi(buildTime, async (_, { auth }) => {
  const userState = await auth.retriever.getClaims();

  return userState.match({
    ok: state => {
      if (state.__kind === 'authed') {
        const claims = state.value.data;
        return { props: { username: claims.username } };
      } else {
        return { redirect: { destination: '/api/logto/sign-in', permanent: false } };
      }
    },
    err: problem => ({ props: { error: problem } }),
  });
});
```

## Configuration

Authentication configured per landscape in server config:

```yaml
# src/config/server/lapras.settings.yaml
auth:
  logto:
    app:
      id: '1b3v8mlb482f78t90os15'
      endpoint: https://xzc47u.logto.app/
    url: http://localhost:3000
    resources:
      alcohol-zinc: https://api.zinc.alcohol.lapras
```

## Sign In/Out

```typescript
// Sign in
window.location.assign('/api/logto/sign-in');

// Sign out
window.location.assign('/api/logto/sign-out');
```

## Getting API Tokens

```typescript
const [result, content] = useTokens();

if (result === 'ok') {
  const [hasData, tokenState] = content;
  if (hasData && tokenState.__kind === 'authed') {
    const tokenSet = tokenState.value.data;
    const zincToken = tokenSet.accessTokens['alcohol-zinc'];
    // Use token for API calls
  }
}
```
