import type { TokenSet } from '@/lib/auth/core/types';
import { decodeJwt } from 'jose';

class AuthChecker {
  toToken(token: string): Record<string, string | number | boolean | string[] | number[] | boolean[] | undefined> {
    return decodeJwt(token);
  }

  isTokenExpired(token: string): boolean {
    const payload = this.toToken(token);
    const exp = payload.exp as number;
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp - 30;
  }

  stateNeedRefresh(ts: TokenSet): boolean {
    return this.isTokenExpired(ts.idToken) || Object.entries(ts.accessTokens).some(([_, v]) => this.isTokenExpired(v));
  }
}

export { AuthChecker };
