import request from 'supertest';
import app from '../app';
import { getJwtSecret } from '../utils/jwtConfig';
import { getAllowedOrigins } from '../server';

describe('Authentication & Security Hardening Unit & Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('JWT_SECRET Fail-Closed Production Behavior', () => {
    it('throws ERR_CONFIG_MISSING (500) in production when JWT_SECRET is missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      expect(() => getJwtSecret()).toThrow('JWT_SECRET environment variable is missing');
    });

    it('throws ERR_CONFIG_MISSING (500) in production when JWT_SECRET is empty whitespace', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = '   ';
      expect(() => getJwtSecret()).toThrow('JWT_SECRET environment variable is missing');
    });

    it('throws ERR_JWT_CONFIG_INVALID (500) in production when JWT_SECRET is less than 32 characters', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'short_secret_under_32_chars';
      expect(() => getJwtSecret()).toThrow('must be at least 32 characters long');
    });

    it('succeeds in production when JWT_SECRET is >= 32 characters long', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a_very_secure_production_jwt_secret_key_1234567890';
      expect(getJwtSecret()).toBe('a_very_secure_production_jwt_secret_key_1234567890');
    });

    it('returns development fallback secret when NODE_ENV is test/development and JWT_SECRET is unset', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.JWT_SECRET;
      expect(getJwtSecret()).toBe('fallback_dev_jwt_secret');
    });
  });

  describe('Socket.io CORS Origin Restricting', () => {
    it('returns wildcard * when NODE_ENV is test or development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.ALLOWED_ORIGINS;
      expect(getAllowedOrigins()).toBe('*');
    });

    it('parses comma-separated origins in production mode', () => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://admin.pondfish.com, https://worker.pondfish.com ';
      expect(getAllowedOrigins()).toEqual(['https://admin.pondfish.com', 'https://worker.pondfish.com']);
    });

    it('returns empty array in production mode when ALLOWED_ORIGINS is omitted', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOWED_ORIGINS;
      expect(getAllowedOrigins()).toEqual([]);
    });
  });

  describe('Health Endpoint Database Verification', () => {
    it('GET /health returns 200 OK with database CONNECTED when database is reachable', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ONLINE');
      expect(res.body.data.database).toBe('CONNECTED');
    });
  });

  describe('Protected Route Token Validation', () => {
    it('GET /api/v1/customer/profile rejects request without Authorization header (401)', async () => {
      const res = await request(app).get('/api/v1/customer/profile');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('ERR_UNAUTHORIZED');
    });

    it('GET /api/v1/customer/profile rejects request with malformed JWT token (401)', async () => {
      const res = await request(app)
        .get('/api/v1/customer/profile')
        .set('Authorization', 'Bearer invalid_jwt_token_string');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('ERR_UNAUTHORIZED');
    });
  });
});
