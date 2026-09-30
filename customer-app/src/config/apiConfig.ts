/**
 * Centralized API Configuration for PondFish Customer Application (React Native)
 *
 * Supports explicit environment variables:
 * - API_BASE_URL or REACT_APP_API_BASE_URL: Explicit URL override (production or custom endpoint)
 * - USE_PHYSICAL_DEVICE ('true' | '1') or DEV_TARGET ('physical') or API_TARGET ('physical'):
 *   Select physical Android device via ADB reverse (http://127.0.0.1:5000/api/v1)
 * - Default development fallback: Android emulator bridge (http://10.0.2.2:5000/api/v1)
 *
 * In production mode, an explicit environment setting (API_BASE_URL) is required.
 */

export type ApiTargetEnvironment = 'production' | 'physical_device' | 'emulator' | 'custom_override';

declare const process: {
  env: {
    API_BASE_URL?: string;
    REACT_APP_API_BASE_URL?: string;
    NODE_ENV?: string;
    USE_PHYSICAL_DEVICE?: string;
    DEV_TARGET?: string;
    API_TARGET?: string;
  };
};

export const PHYSICAL_DEVICE_DEV_URL = 'http://127.0.0.1:5000/api/v1';
export const EMULATOR_DEV_URL = 'http://10.0.2.2:5000/api/v1';

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

  const usePhysical =
    typeof process !== 'undefined' &&
    process.env &&
    (process.env.USE_PHYSICAL_DEVICE === 'true' ||
      process.env.USE_PHYSICAL_DEVICE === '1' ||
      process.env.DEV_TARGET === 'physical' ||
      process.env.API_TARGET === 'physical');

  if (usePhysical) {
    return 'physical_device';
  }

  return 'emulator';
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

  const target = getApiTargetEnvironment();
  if (target === 'physical_device') {
    return PHYSICAL_DEVICE_DEV_URL;
  }

  // Explicit development fallback URL for Android Emulator
  return EMULATOR_DEV_URL;
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

