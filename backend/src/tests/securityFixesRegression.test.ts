import request from 'supertest';
import crypto from 'crypto';
import app from '../app';
import { prisma } from '../prismaClient';
import { AuthModule } from '../modules/authModule';
import { BillProcessingModule } from '../modules/billProcessingModule';
import { getAllowedOrigins } from '../utils/corsConfig';

describe('Security Remediation Pass - Regression Test Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(async () => {
    process.env = originalEnv;
  });

  describe('SECURITY FIX 1: Customer OTP Authentication', () => {
    it('Rejects dev fallback OTP 123456 in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mobile = '+919999888777';

      await expect(
        AuthModule.verifyOTP(mobile, '123456')
      ).rejects.toThrow('Development mock OTP is disabled in production environment.');
    });

    it('Fails closed in production if SMS adapter is missing', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.SMS_ADAPTER;

      await expect(
        AuthModule.sendOTP('+919999888777')
      ).rejects.toThrow('CRITICAL: SMS service adapter is unconfigured');
    });

    it('Enforces maximum OTP verification attempts (locks out after 3 failed attempts)', async () => {
      process.env.NODE_ENV = 'development';
      const mobile = '+919988776655';

      // Send OTP to populate store
      await AuthModule.sendOTP(mobile);

      // Attempt 1 (Wrong OTP)
      await expect(AuthModule.verifyOTP(mobile, '000000')).rejects.toThrow('Incorrect OTP entered.');
      // Attempt 2 (Wrong OTP)
      await expect(AuthModule.verifyOTP(mobile, '000000')).rejects.toThrow('Incorrect OTP entered.');
      // Attempt 3 (Wrong OTP - 3rd failed attempt triggers max attempts lockout)
      await expect(AuthModule.verifyOTP(mobile, '000000')).rejects.toThrow(
        'Maximum verification attempts exceeded. Please request a new OTP.'
      );
    });
  });

  describe('SECURITY FIX 2: Default Credentials Provisioning Safety', () => {
    it('seedAdmin throws in production if ADMIN_INITIAL_PASSWORD is unset', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ADMIN_INITIAL_PASSWORD;

      const { seedAdmin } = require('../../prisma/seedAdmin');
      await expect(seedAdmin()).rejects.toThrow(
        'CRITICAL SECURITY CONFIGURATION ERROR'
      );
    });

    it('seed throws in production if WORKER_INITIAL_PASSWORD is unset', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.WORKER_INITIAL_PASSWORD;

      const { seedDatabase } = require('../../prisma/seed');
      await expect(seedDatabase()).rejects.toThrow(
        'CRITICAL SECURITY CONFIGURATION ERROR'
      );
    });
  });

  describe('SECURITY FIX 3: Bill Object-Level Authorization (BOLA)', () => {
    let customerAId: string;
    let customerBId: string;
    let billBId: string;

    beforeAll(async () => {
      const mobA = '+919100' + Math.floor(100000 + Math.random() * 900000);
      const mobB = '+919200' + Math.floor(100000 + Math.random() * 900000);

      const custA = await prisma.customer.create({
        data: { name: 'Customer A', mobileNumber: mobA },
      });
      customerAId = custA.id;

      const custB = await prisma.customer.create({
        data: { name: 'Customer B', mobileNumber: mobB },
      });
      customerBId = custB.id;

      const billB = await prisma.bill.create({
        data: {
          customerId: customerBId,
          imageUrl: 'https://example.com/bill.jpg',
          status: 'PENDING',
        },
      });
      billBId = billB.id;
    });

    afterAll(async () => {
      if (billBId) await prisma.bill.deleteMany({ where: { id: billBId } });
      if (customerAId || customerBId) {
        await prisma.customer.deleteMany({ where: { id: { in: [customerAId, customerBId].filter(Boolean) } } });
      }
    });

    it('Customer A trying to verify Customer B bill fails with 403 ERR_FORBIDDEN and Bill B remains unchanged', async () => {
      await expect(
        BillProcessingModule.verifyManualBillId(billBId, 'VERIFIED', customerAId)
      ).rejects.toThrow('Access denied. You do not own this bill record.');

      const billBCheck = await prisma.bill.findUnique({ where: { id: billBId } });
      expect(billBCheck?.status).toBe('PENDING');
    });

    it('Customer B verifying their own bill succeeds', async () => {
      const verified = await BillProcessingModule.verifyManualBillId(billBId, 'VERIFIED', customerBId);
      expect(verified.status).toBe('MANUALLY_VERIFIED');
    });

    it('Rejects verification on non-PENDING bill state', async () => {
      await prisma.bill.update({ where: { id: billBId }, data: { status: 'PROCESSED' } });
      await expect(
        BillProcessingModule.verifyManualBillId(billBId, 'VERIFIED', customerBId)
      ).rejects.toThrow('Bill cannot be manually verified from state: PROCESSED.');
    });
  });

  describe('SECURITY FIX 5: CORS Configuration', () => {
    it('Returns empty array in production when ALLOWED_ORIGINS is missing (fail-closed)', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOWED_ORIGINS;
      expect(getAllowedOrigins()).toEqual([]);
    });

    it('Parses comma-separated origins when ALLOWED_ORIGINS is set', () => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://app.pondfish.com, https://admin.pondfish.com';
      expect(getAllowedOrigins()).toEqual(['https://app.pondfish.com', 'https://admin.pondfish.com']);
    });
  });

  describe('SECURITY FIX 6: Razorpay Webhook Hardening', () => {
    const TEST_WEBHOOK_SECRET = 'rzp_test_webhook_secret';
    let bookingId: string;
    let customerId: string;
    let razorpayOrderId: string;

    beforeAll(async () => {
      razorpayOrderId = 'order_test_wh_' + Date.now();
      const mobWH = '+9198' + Math.floor(10000000 + Math.random() * 90000000);

      const cust = await prisma.customer.create({
        data: { name: 'WH Customer', mobileNumber: mobWH },
      });
      customerId = cust.id;

      const booking = await prisma.booking.create({
        data: {
          customerId,
          bookingCode: 'BK-WH-' + Date.now(),
          qrCodeData: 'QR-TEST',
          totalAmount: 5000,
          razorpayPaid: 1000,
          razorpayOrderId,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
      bookingId = booking.id;
    });

    afterAll(async () => {
      if (bookingId) await prisma.payment.deleteMany({ where: { bookingId } });
      if (bookingId) await prisma.booking.deleteMany({ where: { id: bookingId } });
      if (customerId) await prisma.customer.deleteMany({ where: { id: customerId } });
    });

    function sendWebhook(payloadObj: any) {
      process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
      const rawBody = JSON.stringify(payloadObj);
      const signature = crypto.createHmac('sha256', TEST_WEBHOOK_SECRET).update(rawBody).digest('hex');

      return request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .set('x-razorpay-signature', signature)
        .set('Content-Type', 'application/json')
        .send(rawBody);
    }

    it('Rejects webhook with wrong payment amount', async () => {
      const payload = {
        event_id: 'evt_wrong_amt_' + Date.now(),
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_wrong_amt',
              order_id: razorpayOrderId,
              amount: 50000, // 500.00 INR vs booking's 1000.00 INR
            },
          },
        },
      };

      const res = await sendWebhook(payload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ERR_PAYMENT_AMOUNT_MISMATCH');

      const bCheck = await prisma.booking.findUnique({ where: { id: bookingId } });
      expect(bCheck?.status).toBe('PENDING');
    });

    it('Ignores payment.authorized event without confirming booking', async () => {
      const payload = {
        event_id: 'evt_auth_only_' + Date.now(),
        event: 'payment.authorized',
        payload: {
          payment: {
            entity: {
              id: 'pay_auth_only',
              order_id: razorpayOrderId,
              amount: 100000,
            },
          },
        },
      };

      const res = await sendWebhook(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IGNORED');

      const bCheck = await prisma.booking.findUnique({ where: { id: bookingId } });
      expect(bCheck?.status).toBe('PENDING');
    });

    it('Confirms booking on valid payment.captured event with matching amount', async () => {
      const payload = {
        event_id: 'evt_valid_cap_' + Date.now(),
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_valid_cap',
              order_id: razorpayOrderId,
              amount: 100000, // 1000.00 INR matches booking.razorpayPaid
            },
          },
        },
      };

      const res = await sendWebhook(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('PROCESSED');
      expect(res.body.data.bookingStatus).toBe('CONFIRMED');

      const bCheck = await prisma.booking.findUnique({ where: { id: bookingId } });
      expect(bCheck?.status).toBe('CONFIRMED');
    });
  });
});
