import type { AuthState } from '@/lib/auth/core/types';

class AuthStateRetriever {
  constructor(private authState?: AuthState) {}

  private isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return now >= exp - 30;
    } catch (error) {
      return true;
    }
  }

  private needRefresh(state: AuthState): boolean {
    if (state.isAuthenticated) {
      if (state.authData) {
        const ts = state.authData.tokenSet;
        return (
          this.isTokenExpired(ts.idToken) || Object.entries(ts.accessTokens).some(([_, v]) => this.isTokenExpired(v))
        );
      }
      return true;
    }
    return false;
  }

  async get(url: string): Promise<AuthState> {
    if (this.authState == null || this.needRefresh(this.authState)) {
      this.authState = await fetch(url).then(res => res.json());
    }
    // biome-ignore lint/style/noNonNullAssertion: AuthState won't be null at this point
    return this.authState!;
  }
}

export { AuthStateRetriever };
