/**
 * Retrieves the API Base URL for the PondFish Public Website.
 * Uses process.env.NEXT_PUBLIC_API_URL or defaults safely to local backend URL.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  return 'http://localhost:5000';
}
