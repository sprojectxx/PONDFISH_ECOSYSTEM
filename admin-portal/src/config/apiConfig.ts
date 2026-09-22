/// <reference types="vite/client" />

/**
 * Centralized API Configuration for PondFish Admin Portal (Vite + React)
 *
 * Supports dynamic environment configuration via VITE_API_BASE_URL
 * with explicit local development fallback.
 */

export const getAdminApiBaseUrl = (): string => {
  const envUrl = typeof process !== 'undefined' && process.env ? process.env.VITE_API_BASE_URL : undefined;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }

  return 'http://localhost:5000/api/v1';
};

export const ADMIN_API_CONFIG = {
  get baseUrl() {
    return getAdminApiBaseUrl();
  },
  timeoutMs: 15000,
};
