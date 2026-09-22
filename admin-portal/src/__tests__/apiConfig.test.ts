import { getAdminApiBaseUrl, ADMIN_API_CONFIG } from '../config/apiConfig';

describe('ADMIN_API_CONFIG Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns default local backend URL fallback when VITE_API_BASE_URL is undefined', () => {
    const url = getAdminApiBaseUrl();
    expect(url).toBe('http://localhost:5000/api/v1');
  });

  it('provides base URL property via ADMIN_API_CONFIG getter', () => {
    expect(ADMIN_API_CONFIG.baseUrl).toBeDefined();
    expect(typeof ADMIN_API_CONFIG.baseUrl).toBe('string');
  });
});
