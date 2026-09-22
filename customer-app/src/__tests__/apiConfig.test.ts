import { getApiBaseUrl } from '../config/apiConfig';

describe('Customer App Centralized API Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns default development fallback URL when env variables are unset', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.API_BASE_URL;

    const url = getApiBaseUrl();
    expect(url).toBe('http://10.0.2.2:5000/api/v1');
  });

  it('prioritizes EXPO_PUBLIC_API_BASE_URL when present', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.pondfish.com/api/v1/';
    process.env.API_BASE_URL = 'https://other.pondfish.com/api/v1/';

    const url = getApiBaseUrl();
    expect(url).toBe('https://api.pondfish.com/api/v1');
  });

  it('uses API_BASE_URL when EXPO_PUBLIC_API_BASE_URL is not set', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    process.env.API_BASE_URL = 'https://staging.pondfish.com/api/v1/';

    const url = getApiBaseUrl();
    expect(url).toBe('https://staging.pondfish.com/api/v1');
  });
});
