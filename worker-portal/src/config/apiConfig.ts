/// <reference types="vite/client" />

/**
 * Centralized API Configuration for PondFish Worker Portal (Vite + React)
 *
 * Supports dynamic environment configuration via import.meta.env.VITE_API_BASE_URL
 * with explicit local development fallback.
 */

export const getWorkerApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '');
  }

  return 'http://localhost:5000/api/v1';
};

export const WORKER_API_CONFIG = {
  get baseUrl() {
    return getWorkerApiBaseUrl();
  },
  timeoutMs: 15000,
};
