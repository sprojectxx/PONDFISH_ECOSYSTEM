import { getAdminApiBaseUrl, ADMIN_API_CONFIG } from '../config/apiConfig';

describe('ADMIN_API_CONFIG & getAdminApiBaseUrl Unit Tests', () => {
  const originalEnv = process.env.VITE_API_BASE_URL;

  beforeEach(() => {
    delete process.env.VITE_API_BASE_URL;
  });

  afterAll(() => {
    if (originalEnv !== undefined) {
      process.env.VITE_API_BASE_URL = originalEnv;
    } else {
      delete process.env.VITE_API_BASE_URL;
    }
  });

  it('returns default local backend URL fallback when VITE_API_BASE_URL is undefined', () => {
    delete process.env.VITE_API_BASE_URL;
    const url = getAdminApiBaseUrl();
    expect(url).toBe('http://localhost:5000/api/v1');
  });

  it('returns default local backend URL fallback when VITE_API_BASE_URL is empty or whitespace', () => {
    process.env.VITE_API_BASE_URL = '   ';
    expect(getAdminApiBaseUrl()).toBe('http://localhost:5000/api/v1');
  });

  it('respects VITE_API_BASE_URL environment override when defined', () => {
    process.env.VITE_API_BASE_URL = 'https://api.pondfish.com/api/v1';
    expect(getAdminApiBaseUrl()).toBe('https://api.pondfish.com/api/v1');
  });

  it('strips trailing slashes from configured VITE_API_BASE_URL', () => {
    process.env.VITE_API_BASE_URL = 'https://api.pondfish.com/api/v1/';
    expect(getAdminApiBaseUrl()).toBe('https://api.pondfish.com/api/v1');
  });

  it('provides base URL property dynamically via ADMIN_API_CONFIG getter', () => {
    process.env.VITE_API_BASE_URL = 'https://custom-api.pondfish.com/api/v1';
    expect(ADMIN_API_CONFIG.baseUrl).toBe('https://custom-api.pondfish.com/api/v1');
  });
});
