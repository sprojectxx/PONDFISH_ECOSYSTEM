import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@pondfish_customer_jwt';

export class AuthStorageService {
  /**
   * Securely persist authenticated customer JWT token
   */
  static async saveToken(token: string): Promise<void> {
    if (!token || typeof token !== 'string') return;
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // Storage error silent fallback
    }
  }

  /**
   * Retrieve stored JWT token on app startup.
   * Returns token string if valid, or null if missing/corrupted.
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        return null;
      }
      return token;
    } catch {
      // Handle corrupted/unreadable storage safely by clearing
      await this.clearToken();
      return null;
    }
  }

  /**
   * Remove stored JWT token on logout or session corruption
   */
  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // Storage error silent fallback
    }
  }
}
