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

  it('returns default development fallback URL when env variables are unset in non-production mode', () => {
    delete process.env.API_BASE_URL;
    delete process.env.REACT_APP_API_BASE_URL;
    process.env.NODE_ENV = 'development';

    const url = getApiBaseUrl();
    expect(url).toBe('http://10.0.2.2:5000/api/v1');
  });

  it('prioritizes API_BASE_URL when present', () => {
    process.env.API_BASE_URL = 'https://api.pondfish.com/api/v1/';
    process.env.REACT_APP_API_BASE_URL = 'https://other.pondfish.com/api/v1/';

    const url = getApiBaseUrl();
    expect(url).toBe('https://api.pondfish.com/api/v1');
  });

  it('falls back to REACT_APP_API_BASE_URL when API_BASE_URL is not set', () => {
    delete process.env.API_BASE_URL;
    process.env.REACT_APP_API_BASE_URL = 'https://staging.pondfish.com/api/v1/';

    const url = getApiBaseUrl();
    expect(url).toBe('https://staging.pondfish.com/api/v1');
  });

  it('throws explicit configuration error in production when API_BASE_URL is missing', () => {
    delete process.env.API_BASE_URL;
    delete process.env.REACT_APP_API_BASE_URL;
    process.env.NODE_ENV = 'production';

    expect(() => getApiBaseUrl()).toThrow('CONFIG_ERROR: API_BASE_URL environment variable is required in production builds.');
  });
});
