/**
 * Centralized API Configuration for PondFish Customer Application
 *
 * Supports dynamic environment variables (process.env.EXPO_PUBLIC_API_BASE_URL or process.env.API_BASE_URL)
 * with robust platform-aware fallbacks (10.0.2.2 for Android Emulator, localhost for iOS/Web).
 */

declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
    API_BASE_URL?: string;
    NODE_ENV?: string;
  };
};

export const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
      return process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, '');
    }
    if (process.env.API_BASE_URL) {
      return process.env.API_BASE_URL.replace(/\/$/, '');
    }
  }

  // Default development fallback URL (Android Emulator localhost bridge)
  return 'http://10.0.2.2:5000/api/v1';
};

export const API_CONFIG = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  timeoutMs: 15000,
};
