/**
 * Centralized API Configuration for PondFish Customer Application (React Native)
 *
 * Supports explicit environment variables (process.env.API_BASE_URL or process.env.REACT_APP_API_BASE_URL).
 * In production mode, an explicit environment setting is required.
 * In development mode, falls back to local emulator bridge (http://10.0.2.2:5000/api/v1).
 */

declare const process: {
  env: {
    API_BASE_URL?: string;
    REACT_APP_API_BASE_URL?: string;
    NODE_ENV?: string;
  };
};

export const getApiBaseUrl = (): string => {
  const envUrl =
    typeof process !== 'undefined' && process.env
      ? process.env.API_BASE_URL || process.env.REACT_APP_API_BASE_URL
      : undefined;

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const isProduction = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';
  if (isProduction) {
    throw new Error('CONFIG_ERROR: API_BASE_URL environment variable is required in production builds.');
  }

  // Explicit development fallback URL
  return 'http://10.0.2.2:5000/api/v1';
};

export const API_CONFIG = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  timeoutMs: 15000,
};
