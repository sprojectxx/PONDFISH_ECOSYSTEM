/// <reference types="vite/client" />

/**
 * Centralized Socket & API Configuration for PondFish TV Portal (Vite + React)
 *
 * Defaults to http://localhost:5000 in local development.
 * Supports configurable VITE_SOCKET_URL or VITE_API_BASE_URL in production.
 */

export const getTvSocketUrl = (): string => {
  const envUrl = typeof process !== 'undefined' && process.env ? (process.env.VITE_SOCKET_URL || process.env.VITE_API_BASE_URL) : undefined;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const raw = envUrl.trim();
    return raw.replace(/\/$/, '').replace(/\/api\/v1$/, '');
  }

  return 'http://localhost:5000';
};

export const TV_API_CONFIG = {
  get socketUrl() {
    return getTvSocketUrl();
  },
  reconnectionAttempts: 10,
  timeoutMs: 5000,
};
