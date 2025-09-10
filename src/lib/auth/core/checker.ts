import type { TokenSet } from '@/lib/auth/core/types';

class AuthChecker {
  isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp - 30;
  }

  stateNeedRefresh(ts: TokenSet): boolean {
    return this.isTokenExpired(ts.idToken) || Object.entries(ts.accessTokens).some(([_, v]) => this.isTokenExpired(v));
  }
}

export { AuthChecker };
