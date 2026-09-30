/// <reference types="vite/client" />

/**
 * Centralized API Configuration for PondFish Worker Portal (Vite + React)
 *
 * Supports dynamic environment configuration via import.meta.env.VITE_API_BASE_URL
 * with explicit local development and Jest test suite fallback.
 */

export const getWorkerApiBaseUrl = (): string => {
  try {
    const metaEnv = (new Function('try { return import.meta.env; } catch { return null; }'))();
    if (metaEnv && metaEnv.VITE_API_BASE_URL) {
      return (metaEnv.VITE_API_BASE_URL as string).replace(/\/$/, '');
    }
  } catch {
    // Ignore syntax check in CJS/Jest environment
  }

  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
    return (process.env.VITE_API_BASE_URL as string).replace(/\/$/, '');
  }

  return 'http://localhost:5000/api/v1';
};

export const WORKER_API_CONFIG = {
  get baseUrl() {
    return getWorkerApiBaseUrl();
  },
  timeoutMs: 15000,
};
