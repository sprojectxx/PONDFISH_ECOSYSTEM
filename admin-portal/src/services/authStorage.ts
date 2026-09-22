const ADMIN_TOKEN_KEY = 'pondfish_admin_jwt';

export class AdminAuthStorageService {
  /**
   * Persist authenticated admin JWT token in storage
   */
  static saveToken(token: string): void {
    if (!token || typeof token !== 'string') return;
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch {
      // localStorage fallback
    }
  }

  /**
   * Retrieve stored admin JWT token on startup.
   * Returns token string if valid, or null if missing/corrupted.
   */
  static getToken(): string | null {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        return null;
      }
      return token;
    } catch {
      // Clear token safely on unreadable/corrupted storage
      this.clearToken();
      return null;
    }
  }

  /**
   * Remove stored admin JWT token on logout or session corruption
   */
  static clearToken(): void {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {
      // localStorage fallback
    }
  }
}
