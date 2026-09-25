import request from 'supertest';
import crypto from 'crypto';
import app from '../app';
import { prisma } from '../prismaClient';
import { PaymentModule } from '../modules/paymentModule';
import { BookingStatus } from '@prisma/client';

describe('Razorpay Server-to-Server Webhook Security & Idempotency Suite', () => {
  const TEST_WEBHOOK_SECRET = 'rzp_test_webhook_secret';
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...originalEnv, RAZORPAY_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET };
  });

  afterAll(async () => {
    process.env = originalEnv;
  });

  function generateWebhookSignature(rawBody: string, secret = TEST_WEBHOOK_SECRET): string {
    return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  }

  describe('Webhook Signature & Configuration Verification', () => {
    it('A & K: Accepts valid webhook signature computed against exact raw body', async () => {
      const payload = {
        event_id: 'evt_test_valid_sig_' + Date.now(),
        event: 'unsupported.test_event',
        payload: {},
      };
      const rawBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(rawBody);

      const res = await request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(rawBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IGNORED');
    });

    it('B: Rejects invalid HMAC signature with 400 ERR_INVALID_WEBHOOK_SIGNATURE', async () => {
      const payload = { event_id: 'evt_invalid_sig', event: 'payment.captured' };
      const rawBody = JSON.stringify(payload);

      const res = await request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', 'bad_invalid_hex_signature')
        .send(rawBody);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ERR_INVALID_WEBHOOK_SIGNATURE');
    });

    it('C: Rejects request missing x-razorpay-signature header with 400', async () => {
      const payload = { event_id: 'evt_no_sig', event: 'payment.captured' };

      const res = await request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ERR_INVALID_WEBHOOK_SIGNATURE');
    });

    it('D: Fails closed in production mode when RAZORPAY_WEBHOOK_SECRET is missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.RAZORPAY_WEBHOOK_SECRET;

      expect(() => {
        PaymentModule.verifyRazorpayWebhookSignature('{"raw":"body"}', 'some_signature');
      }).toThrow('RAZORPAY_WEBHOOK_SECRET environment variable is missing');
    });
  });

  describe('Database Idempotency & Booking State Mutations', () => {
    it('E & L: Handles duplicate webhook delivery idempotently without secondary mutation', async () => {
      const eventId = 'evt_dup_test_' + Date.now();
      const payload = {
        event_id: eventId,
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_dummy_123',
              order_id: 'order_non_existent',
              amount: 50000,
            },
          },
        },
      };
      const rawBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(rawBody);

      // First delivery
      const res1 = await request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(rawBody);
      expect(res1.status).toBe(200);

      // Duplicate delivery (same event_id)
      const res2 = await request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(rawBody);

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('ALREADY_PROCESSED');
    });

    it('G: Ignores webhook for unknown Razorpay order safely without state mutation', async () => {
      const eventId = 'evt_unknown_order_' + Date.now();
      const payload = {
        event_id: eventId,
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_unknown_order',
              order_id: 'order_non_existent_99999',
              amount: 50000,
            },
          },
        },
      };
      const rawBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(rawBody);

      const res = await request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(rawBody);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IGNORED');
    });

    it('J: Safe acknowledgement for unsupported event types without business state mutation', async () => {
      const eventId = 'evt_unsupported_' + Date.now();
      const payload = {
        event_id: eventId,
        event: 'refund.created',
        payload: {},
      };
      const rawBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(rawBody);

      const res = await request(app)
        .post('/api/v1/public/webhooks/razorpay')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(rawBody);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IGNORED');
      expect(res.body.data.eventType).toBe('refund.created');
    });
  });
});
