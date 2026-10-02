/**
 * Centralized API Configuration for PondFish Customer Application (React Native)
 *
 * Supports explicit environment variables:
 * - API_BASE_URL or REACT_APP_API_BASE_URL: Explicit URL override (production or custom endpoint)
 * - Default development fallback: http://127.0.0.1:5000/api/v1
 *   (Routes seamlessly to host PC backend for physical devices & emulators via ADB reverse)
 *
 * In production mode, an explicit environment setting (API_BASE_URL) is required.
 */

export type ApiTargetEnvironment = 'production' | 'development' | 'custom_override';

declare const process: {
  env: {
    API_BASE_URL?: string;
    REACT_APP_API_BASE_URL?: string;
    NODE_ENV?: string;
  };
};

export const DEV_API_URL = 'http://127.0.0.1:5000/api/v1';

export const getApiTargetEnvironment = (): ApiTargetEnvironment => {
  const envUrl =
    typeof process !== 'undefined' && process.env
      ? process.env.API_BASE_URL || process.env.REACT_APP_API_BASE_URL
      : undefined;

  const isProduction =
    typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';

  if (isProduction && !envUrl) {
    return 'production';
  }

  if (envUrl) {
    return 'custom_override';
  }

  return 'development';
};

export const getApiBaseUrl = (): string => {
  const envUrl =
    typeof process !== 'undefined' && process.env
      ? process.env.API_BASE_URL || process.env.REACT_APP_API_BASE_URL
      : undefined;

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const isProduction =
    typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';
  if (isProduction) {
    throw new Error('CONFIG_ERROR: API_BASE_URL environment variable is required in production builds.');
  }

  // Development fallback for physical device & emulator via ADB reverse
  return DEV_API_URL;
};

export const API_CONFIG = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  get targetEnvironment() {
    return getApiTargetEnvironment();
  },
  timeoutMs: 15000,
};
