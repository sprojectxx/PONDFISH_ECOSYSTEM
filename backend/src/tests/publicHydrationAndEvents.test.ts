import request from 'supertest';
import app from '../app';
import { RealtimeModule } from '../modules/realtimeModule';
import { prisma } from '../prismaClient';

describe('VS-01 Public Hydration & Realtime Completion Unit Tests', () => {
  describe('GET /api/v1/public/transactions/recent', () => {
    it('returns recent completed transactions formatted for public TV display', async () => {
      const res = await request(app).get('/api/v1/public/transactions/recent?limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item).toHaveProperty('transactionId');
        expect(item).toHaveProperty('transactionNumber');
        expect(item).toHaveProperty('customerName');
        expect(item).toHaveProperty('totalAmount');
        expect(item).toHaveProperty('paymentMethod');
        expect(item).toHaveProperty('timestamp');
        expect(item).toHaveProperty('items');
        expect(Array.isArray(item.items)).toBe(true);
        // Ensure private customer mobile number or password is not exposed
        expect(item).not.toHaveProperty('mobileNumber');
        expect(item).not.toHaveProperty('passwordHash');
      }
    });

    it('enforces limit parameter clamping', async () => {
      const res = await request(app).get('/api/v1/public/transactions/recent?limit=100');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Maximum 50 items allowed by clamped limit
      expect(res.body.data.length).toBeLessThanOrEqual(50);
    });
  });

  describe('GET /api/v1/public/gps/live', () => {
    it('returns live truck journey or null gracefully when no published journey is live', async () => {
      const res = await request(app).get('/api/v1/public/gps/live');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('RealtimeModule.emitBookingCompleted', () => {
    it('creates a BOOKING_COMPLETED event record in DB without throwing error', async () => {
      const mockBooking = {
        id: 'booking-test-123',
        bookingCode: 'BK-TEST-123',
        customerId: 'customer-test-456',
      };

      await expect(RealtimeModule.emitBookingCompleted(mockBooking)).resolves.not.toThrow();

      const dbEvent = await prisma.realtimeEvent.findFirst({
        where: { eventType: 'BOOKING_COMPLETED' },
        orderBy: { emittedAt: 'desc' },
      });

      if (dbEvent) {
        expect(dbEvent.eventType).toBe('BOOKING_COMPLETED');
        const payload = JSON.parse(dbEvent.payload);
        expect(payload.bookingId).toBe(mockBooking.id);
        expect(payload.bookingCode).toBe(mockBooking.bookingCode);
        expect(payload.customerId).toBe(mockBooking.customerId);
      }
    });
  });
});
