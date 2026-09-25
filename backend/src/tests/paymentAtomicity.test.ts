import crypto from 'crypto';
import { PaymentModule } from '../modules/paymentModule';
import { DomainError } from '../middleware/errorHandler';
import { prisma } from '../prismaClient';

const TEST_SECRET = 'test_secret_key_999';

function generateValidSignature(orderId: string, paymentId: string, secret = TEST_SECRET): string {
  return crypto
    .createHmac('sha256', secret)
    .update(orderId + '|' + paymentId)
    .digest('hex');
}

jest.mock('../prismaClient', () => {
  return {
    prisma: {
      payment: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      booking: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      transaction: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };
});

describe('PaymentModule - Signature Verification & Atomicity Security Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('TEST 1: Correct HMAC signature is accepted and creates payment inside transaction', async () => {
    const orderId = 'order_101';
    const paymentId = 'pay_101';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-101', status: 'PENDING', razorpayPaid: 500.0 };
    const mockCreatedPayment = {
      id: 'pay-db-101',
      bookingId: 'bk-101',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 500.0,
      method: 'RAZORPAY',
      status: 'SUCCESS',
    };

    const mockTxBookingUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const mockTxPaymentCreate = jest.fn().mockResolvedValue(mockCreatedPayment);

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), updateMany: mockTxBookingUpdateMany },
        transaction: { findUnique: jest.fn(), update: jest.fn() },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 500.0,
      bookingId: 'bk-101',
    });

    expect(result).toEqual(mockCreatedPayment);
    expect(mockTxBookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'bk-101', status: 'PENDING' },
      data: { status: 'CONFIRMED' },
    });
    expect(mockTxPaymentCreate).toHaveBeenCalled();
  });

  it('TEST 2: Incorrect HMAC signature in development environment (NODE_ENV=development) MUST be rejected', async () => {
    process.env.NODE_ENV = 'development';
    const orderId = 'order_dev_123';
    const paymentId = 'pay_dev_123';
    const bogusSignature = 'bogus_signature_in_dev_mode';

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: bogusSignature,
        amount: 200.0,
        bookingId: 'bk-dev-123',
      });
      fail('Should have rejected bogus signature in NODE_ENV=development');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_VERIFY_FAILED');
      expect(err.statusCode).toBe(400);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 3: Incorrect HMAC signature in production environment (NODE_ENV=production) MUST be rejected', async () => {
    process.env.NODE_ENV = 'production';
    const orderId = 'order_prod_456';
    const paymentId = 'pay_prod_456';
    const bogusSignature = 'invalid_signature_prod';

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: bogusSignature,
        amount: 400.0,
        bookingId: 'bk-prod-456',
      });
      fail('Should have rejected bogus signature in NODE_ENV=production');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_VERIFY_FAILED');
      expect(err.statusCode).toBe(400);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 4: Missing RAZORPAY_KEY_SECRET throws controlled ERR_RAZORPAY_CONFIG (500) and blocks all mutations', async () => {
    delete process.env.RAZORPAY_KEY_SECRET;

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_no_secret',
        razorpayPaymentId: 'pay_no_secret',
        razorpaySignature: 'any_signature',
        amount: 150.0,
        bookingId: 'bk-no-secret',
      });
      fail('Should have thrown ERR_RAZORPAY_CONFIG due to missing secret');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_CONFIG');
      expect(err.statusCode).toBe(500);
      expect(err.message).toContain('Razorpay secret key is not configured');
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 5: Valid HMAC with NODE_ENV=development is accepted when signature is cryptographically valid', async () => {
    process.env.NODE_ENV = 'development';
    const orderId = 'order_dev_valid';
    const paymentId = 'pay_dev_valid';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-dev-valid', status: 'PENDING', razorpayPaid: 300.0 };
    const mockCreatedPayment = { id: 'pay-dev-res', razorpayPaymentId: paymentId, amount: 300.0, status: 'SUCCESS' };

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(mockCreatedPayment) },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        transaction: { findUnique: jest.fn(), update: jest.fn() },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 300.0,
      bookingId: 'bk-dev-valid',
    });

    expect(result).toEqual(mockCreatedPayment);
  });

  it('TEST 6: Valid HMAC with NODE_ENV=production is accepted when signature is cryptographically valid', async () => {
    process.env.NODE_ENV = 'production';
    const orderId = 'order_prod_valid';
    const paymentId = 'pay_prod_valid';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-prod-valid', status: 'PENDING', razorpayPaid: 750.0 };
    const mockCreatedPayment = { id: 'pay-prod-res', razorpayPaymentId: paymentId, amount: 750.0, status: 'SUCCESS' };

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(mockCreatedPayment) },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        transaction: { findUnique: jest.fn(), update: jest.fn() },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 750.0,
      bookingId: 'bk-prod-valid',
    });

    expect(result).toEqual(mockCreatedPayment);
  });

  it('TEST 7: Existing payment ID remains idempotent and returns existing payment record', async () => {
    const orderId = 'order_idem';
    const paymentId = 'pay_idem_existing';
    const validSig = generateValidSignature(orderId, paymentId);

    const existingPaymentRecord = { id: 'pay-existing-record', razorpayPaymentId: paymentId, amount: 600.0, status: 'SUCCESS' };
    const mockTxBookingUpdateMany = jest.fn();
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(existingPaymentRecord), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn(), updateMany: mockTxBookingUpdateMany },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 600.0,
      bookingId: 'bk-idem',
    });

    expect(result).toEqual(existingPaymentRecord);
    expect(mockTxBookingUpdateMany).not.toHaveBeenCalled();
    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 8: Expired booking with valid signature throws ERR_BOOKING_EXPIRED and commits zero payment', async () => {
    const orderId = 'order_exp';
    const paymentId = 'pay_exp';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockExpiredBooking = { id: 'bk-expired-888', status: 'EXPIRED', razorpayPaid: 350.0 };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockExpiredBooking), updateMany: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 350.0,
        bookingId: 'bk-expired-888',
      });
      fail('Should have thrown ERR_BOOKING_EXPIRED');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_BOOKING_EXPIRED');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 9: Amount mismatch with valid signature throws ERR_PAYMENT_AMOUNT_MISMATCH and commits zero payment', async () => {
    const orderId = 'order_mismatch';
    const paymentId = 'pay_mismatch';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-mismatch-999', status: 'PENDING', razorpayPaid: 1000.0 };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), updateMany: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 500.0, // Tampered amount (500 vs expected 1000)
        bookingId: 'bk-mismatch-999',
      });
      fail('Should have thrown ERR_PAYMENT_AMOUNT_MISMATCH');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_PAYMENT_AMOUNT_MISMATCH');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 10: Database failure inside transaction rolls back entire transaction with zero payment creation', async () => {
    const orderId = 'order_db_fail';
    const paymentId = 'pay_db_fail';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-db-fail', status: 'PENDING', razorpayPaid: 450.0 };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), updateMany: jest.fn().mockRejectedValue(new Error('Fatal DB Connection Error')) },
      };
      return cb(tx);
    });

    await expect(
      PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 450.0,
        bookingId: 'bk-db-fail',
      })
    ).rejects.toThrow('Fatal DB Connection Error');

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });
});
