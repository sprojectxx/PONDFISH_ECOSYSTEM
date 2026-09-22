/// <reference types="vite/client" />

/**
 * Centralized API Configuration for PondFish Admin Portal (Vite + React)
 *
 * Supports dynamic environment configuration via import.meta.env.VITE_API_BASE_URL
 * or process.env.VITE_API_BASE_URL with explicit local development fallback.
 */

export const getAdminApiBaseUrl = (): string => {
  try {
    // Safely evaluate import.meta for Vite ESM bundler without breaking Jest CommonJS environment
    const metaEnv = Function('return import.meta.env')();
    if (metaEnv && metaEnv.VITE_API_BASE_URL) {
      return (metaEnv.VITE_API_BASE_URL as string).replace(/\/$/, '');
    }
  } catch {
    // Fallback when executed under Jest / CommonJS runner
  }

  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
    return (process.env.VITE_API_BASE_URL as string).replace(/\/$/, '');
  }

  return 'http://localhost:5000/api/v1';
};

export const ADMIN_API_CONFIG = {
  get baseUrl() {
    return getAdminApiBaseUrl();
  },
  timeoutMs: 15000,
};
