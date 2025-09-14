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

  return authState.match({
    authed: ({ data: claims }) => <div>Welcome {claims.username}!</div>,
    unauthed: () => (
      <button onClick={() => window.location.assign('/api/logto/sign-in')}>
        Sign In
      </button>
    ),
  });
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
export const getServerSideProps = withServerSideAtomi(buildTime, async (context, { auth }) => {
  const userState = await auth.getClaims();

  return userState.match({
    ok: state =>
      state.match({
        authed: ({ data: claims }) => ({ props: { username: claims.username } }),
        unauthed: () => ({ redirect: { destination: '/api/logto/sign-in', permanent: false } }),
      }),
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
  if (hasData && tokenState.isAuthed) {
    const { accessTokens } = tokenState.data;
    const zincToken = accessTokens['alcohol-zinc'];
    // Use token for API calls
  }
}
```
