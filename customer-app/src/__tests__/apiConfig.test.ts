import { getApiBaseUrl, getApiTargetEnvironment, API_CONFIG, DEV_API_URL } from '../config/apiConfig';

describe('Customer App Centralized API Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns default development fallback URL (127.0.0.1:5000) when env variables are unset in non-production mode', () => {
    delete process.env.API_BASE_URL;
    delete process.env.REACT_APP_API_BASE_URL;
    process.env.NODE_ENV = 'development';

    const url = getApiBaseUrl();
    expect(url).toBe(DEV_API_URL);
    expect(url).toBe('http://127.0.0.1:5000/api/v1');
    expect(getApiTargetEnvironment()).toBe('development');
    expect(API_CONFIG.targetEnvironment).toBe('development');
  });

  it('prioritizes API_BASE_URL when present', () => {
    process.env.API_BASE_URL = 'https://api.pondfish.com/api/v1/';
    process.env.REACT_APP_API_BASE_URL = 'https://other.pondfish.com/api/v1/';

    const url = getApiBaseUrl();
    expect(url).toBe('https://api.pondfish.com/api/v1');
    expect(getApiTargetEnvironment()).toBe('custom_override');
    expect(API_CONFIG.targetEnvironment).toBe('custom_override');
  });

  it('falls back to REACT_APP_API_BASE_URL when API_BASE_URL is not set', () => {
    delete process.env.API_BASE_URL;
    process.env.REACT_APP_API_BASE_URL = 'https://staging.pondfish.com/api/v1/';

    const url = getApiBaseUrl();
    expect(url).toBe('https://staging.pondfish.com/api/v1');
    expect(getApiTargetEnvironment()).toBe('custom_override');
  });

  it('throws explicit configuration error in production when API_BASE_URL is missing', () => {
    delete process.env.API_BASE_URL;
    delete process.env.REACT_APP_API_BASE_URL;
    process.env.NODE_ENV = 'production';

    expect(() => getApiBaseUrl()).toThrow('CONFIG_ERROR: API_BASE_URL environment variable is required in production builds.');
    expect(getApiTargetEnvironment()).toBe('production');
  });
});
