import { getTvSocketUrl, TV_API_CONFIG } from '../config/apiConfig';
import { normalizeTransactionEvent } from '../App';

describe('TV Portal Real-Time Transaction Integration Unit Tests', () => {
  const originalEnv = process.env.VITE_SOCKET_URL;
  const originalApiEnv = process.env.VITE_API_BASE_URL;

  beforeEach(() => {
    delete process.env.VITE_SOCKET_URL;
    delete process.env.VITE_API_BASE_URL;
  });

  afterAll(() => {
    if (originalEnv !== undefined) process.env.VITE_SOCKET_URL = originalEnv;
    else delete process.env.VITE_SOCKET_URL;

    if (originalApiEnv !== undefined) process.env.VITE_API_BASE_URL = originalApiEnv;
    else delete process.env.VITE_API_BASE_URL;
  });

  describe('TASK 7 — API & Socket Configuration', () => {
    it('defaults to http://localhost:5000 when VITE_SOCKET_URL is omitted', () => {
      expect(getTvSocketUrl()).toBe('http://localhost:5000');
      expect(TV_API_CONFIG.socketUrl).toBe('http://localhost:5000');
    });

    it('respects VITE_SOCKET_URL environment override when defined', () => {
      process.env.VITE_SOCKET_URL = 'https://api.pondfish.com';
      expect(getTvSocketUrl()).toBe('https://api.pondfish.com');
    });

    it('derives socket origin correctly from VITE_API_BASE_URL with /api/v1 path', () => {
      process.env.VITE_API_BASE_URL = 'https://api.pondfish.com/api/v1';
      expect(getTvSocketUrl()).toBe('https://api.pondfish.com');
    });
  });

  describe('TASK 2 & 3 — Backend Event Contract Payload Normalization', () => {
    it('correctly maps backend RealtimeModule TRANSACTION_COMPLETED payload', () => {
      const backendPayload = {
        transactionId: 'txn-uuid-888',
        transactionNumber: 'TXN-2026-0001',
        customerName: 'Rajesh Sharma',
        totalBillAmount: 850,
        finalPaidAmount: 850,
        paymentMethod: 'CASH',
        items: [
          { fishName: 'Fresh Rohu', quantityKg: 2.5, unitPrice: 200, subtotal: 500 },
          { fishName: 'Catla Fresh Catch', quantityKg: 1.0, unitPrice: 350, subtotal: 350 },
        ],
        timestamp: '2026-09-23T01:30:00.000Z',
      };

      const normalized = normalizeTransactionEvent(backendPayload);

      expect(normalized).not.toBeNull();
      expect(normalized?.transactionId).toBe('txn-uuid-888');
      expect(normalized?.transactionNumber).toBe('TXN-2026-0001');
      expect(normalized?.customerName).toBe('Rajesh Sharma');
      expect(normalized?.totalAmount).toBe(850);
      expect(normalized?.paymentMethod).toBe('CASH');
      expect(normalized?.items).toHaveLength(2);
      expect(normalized?.items[0].name).toBe('Fresh Rohu');
      expect(normalized?.items[0].quantityKg).toBe(2.5);
      expect(normalized?.items[0].price).toBe(200);
      expect(normalized?.items[0].subtotal).toBe(500);
    });

    it('handles in-store customer fallback when customerName is omitted', () => {
      const backendPayload = {
        transactionId: 'txn-uuid-999',
        totalBillAmount: 400,
        items: [{ fishName: 'Tilapia', quantityKg: 2, unitPrice: 200, subtotal: 400 }],
      };

      const normalized = normalizeTransactionEvent(backendPayload);

      expect(normalized?.customerName).toBe('In-Store Customer');
      expect(normalized?.paymentMethod).toBe('CASH');
      expect(normalized?.transactionNumber).toBe('txn-uuid');
    });

    it('returns null if transaction event has no transactionId or id', () => {
      expect(normalizeTransactionEvent({})).toBeNull();
      expect(normalizeTransactionEvent(null)).toBeNull();
    });
  });
});
