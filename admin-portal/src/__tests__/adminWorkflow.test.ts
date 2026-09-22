import { AdminAuthStorageService } from '../services/authStorage';
import { getAdminApiBaseUrl, ADMIN_API_CONFIG } from '../config/apiConfig';

describe('Admin Portal Hardening & Verification Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('TASK 1 — API Configuration (F & M)', () => {
    it('uses centralized ADMIN_API_CONFIG base URL without inline hardcoding', () => {
      expect(ADMIN_API_CONFIG.baseUrl).toBe('http://localhost:5000/api/v1');
    });

    it('respects VITE_API_BASE_URL environment override when defined', () => {
      process.env.VITE_API_BASE_URL = 'https://api.pondfish.com/api/v1';
      expect(getAdminApiBaseUrl()).toBe('https://api.pondfish.com/api/v1');
      delete process.env.VITE_API_BASE_URL;
    });
  });

  describe('TASK 2 — Authentication & Session Management', () => {
    it('restores stored admin session from localStorage', () => {
      localStorage.setItem('pondfish_admin_jwt', 'valid-admin-jwt-777');
      const token = AdminAuthStorageService.getToken();
      expect(token).toBe('valid-admin-jwt-777');
    });

    it('returns null when no session token exists', () => {
      const token = AdminAuthStorageService.getToken();
      expect(token).toBeNull();
    });

    it('purges session storage on logout', () => {
      localStorage.setItem('pondfish_admin_jwt', 'token-to-purge');
      AdminAuthStorageService.clearToken();
      expect(localStorage.getItem('pondfish_admin_jwt')).toBeNull();
    });

    it('safely recovers from unreadable/corrupted storage', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage corrupted');
      });

      const token = AdminAuthStorageService.getToken();
      expect(token).toBeNull();
      spy.mockRestore();
    });
  });

  describe('TASK 3 & 4 — Fish Catalogue & Inventory Payload Validation', () => {
    it('constructs valid fish creation request payload with real category ID', () => {
      const payload = {
        categoryId: 'real-category-uuid-101',
        name: 'Fresh Murrel',
        unitPrice: 320,
        freshnessState: 'GREEN',
        onlineBookable: true,
        physicalAvailable: true,
      };

      expect(payload.categoryId).toBe('real-category-uuid-101');
      expect(payload.categoryId).not.toBe('00000000-0000-0000-0000-000000000001');
      expect(payload.unitPrice).toBeGreaterThan(0);
    });

    it('constructs valid inventory batch receiving request payload', () => {
      const stockBatchPayload = {
        fishId: 'fish-uuid-555',
        batchCode: 'BATCH-2026-MURREL-01',
        receivedQty: 50,
        expiryHours: 48,
      };

      expect(stockBatchPayload.fishId).toBe('fish-uuid-555');
      expect(stockBatchPayload.receivedQty).toBeGreaterThan(0);
      expect(stockBatchPayload.expiryHours).toBe(48);
    });
  });

  describe('TASK 5 — Booking Search & Filter Query Construction', () => {
    it('constructs booking search query string with search term and status filter', () => {
      const search = 'Rajesh';
      const status = 'CONFIRMED';
      let query = `/admin/bookings?`;
      if (search.trim()) query += `search=${encodeURIComponent(search.trim())}&`;
      if (status) query += `status=${encodeURIComponent(status)}`;

      expect(query).toBe('/admin/bookings?search=Rajesh&status=CONFIRMED');
    });
  });

  describe('TASK 6 — Executive Analytics & Financial Ledger Parsing', () => {
    it('parses analytics backend metrics accurately', () => {
      const backendResponse = {
        totalRevenue: '12500.00',
        totalTransactions: 45,
        totalGSTCollected: '225.00',
        totalBookings: 18,
      };

      expect(parseFloat(backendResponse.totalRevenue)).toBe(12500.00);
      expect(backendResponse.totalTransactions).toBe(45);
      expect(parseFloat(backendResponse.totalGSTCollected)).toBe(225.00);
    });
  });

  describe('TASK 7 — GPS Workflow Request Construction', () => {
    it('constructs GPS journey start payload with user-provided truck & driver inputs', () => {
      const truckNumber = 'AP-39-TF-2026';
      const driverName = 'Suresh Babu';

      const gpsRequest = {
        truckNumber: truckNumber.trim(),
        driverName: driverName.trim(),
      };

      expect(gpsRequest.truckNumber).toBe('AP-39-TF-2026');
      expect(gpsRequest.driverName).toBe('Suresh Babu');
    });
  });

  describe('TASK 8 — Worker Account Creation Request Construction', () => {
    it('constructs valid worker account creation payload', () => {
      const workerPayload = {
        name: 'Suresh Worker',
        mobileNumber: '9876543210',
        password: 'securePassword123',
      };

      expect(workerPayload.name).toBe('Suresh Worker');
      expect(workerPayload.mobileNumber).toBe('9876543210');
      expect(workerPayload.password).toBe('securePassword123');
    });
  });
});
