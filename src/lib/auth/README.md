# Auth Library

Functional, type-safe authentication system built on Logto with Result monad integration and discriminated unions.

## Architecture

```
auth/
├── core/
│   ├── types.ts              # Types and interfaces
│   ├── checker.ts            # Token validation
│   ├── client/retriever.ts   # Client-side auth retrieval
│   └── server/
│       ├── retriever.ts      # Server-side auth retrieval
│       └── adapter.ts        # Module builder
├── next/
│   ├── adapter.ts            # Next.js integration
│   └── auth.ts               # API handlers
└── providers/hooks.ts        # React hooks with SWR
```

## Core Types

```typescript
type AuthState<T extends AuthData> = DU<[
  ['authed', { isAuthed: true; data: T }],
  ['unauthed', { isAuthed: false }]
]>

interface IAuthStateRetriever {
  getTokenSet(): Result<AuthState<TokenSet>, Problem>
  getClaims(): Result<AuthState<IdTokenClaims>, Problem>
  getUserInfo(): Result<AuthState<UserInfoResponse>, Problem>
}
```

**Data Types**: `TokenSet`, `IdTokenClaims`, `UserInfoResponse`

## Token Management

```typescript
class AuthChecker {
  isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp - 30; // 30-second buffer
  }

  stateNeedRefresh(ts: TokenSet): boolean {
    return this.isTokenExpired(ts.idToken) ||
           Object.entries(ts.accessTokens).some(([_, v]) => this.isTokenExpired(v));
  }
}
```

## Server Implementation

`ServerAuthStateRetriever`: Handles SSR/API routes with lazy NodeClient caching and token refresh.

**State Flow**: Check auth → return `{ __kind: 'unauthed', value: { isAuthed: false } }` or `{ __kind: 'authed', value: { isAuthed: true, data } }`

## Client Implementation

`ClientAuthStateRetriever`: Browser contexts with memory caching and cache-first strategy.

## React Hooks

SWR-based hooks with SSR support:

```typescript
function useUserInfo(initial?: AuthState<UserInfoResponse>): Content<AuthState<UserInfoResponse>, Problem>

// Return type: ResultSerial<OptionSerial<T>, Problem>
// Loading: ['ok', [false, null]]
// Error: ['err', Problem]
// Success: ['ok', [true, AuthState<T>]]
```

## API Endpoints

- `GET /api/auth/claims` → ID token claims
- `GET /api/auth/user` → User profile
- `GET /api/auth/tokens` → Token set

All return `ResultSerial<AuthState<T>, Problem>`

## Usage

**API Route**:
```typescript
export default withApiAuth(async ({ auth }, req, res) => {
  const result = await auth.getUserInfo()
  // Handle Result<AuthState<UserInfoResponse>, Problem>
})
```

**Component**:
```typescript
function UserProfile() {
  const userInfo = useUserInfo()
  if (userInfo[0] === 'err') return <Error problem={userInfo[1]} />
  const [hasData, state] = userInfo[1]
  if (!hasData) return <Loading />
  return state.__kind === 'authed'
    ? <div>Welcome {state.value.data.name}</div>
    : <LoginButton />
}
```