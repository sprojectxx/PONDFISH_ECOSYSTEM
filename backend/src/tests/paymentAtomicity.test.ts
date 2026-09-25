import crypto from 'crypto';
import { PaymentModule } from '../modules/paymentModule';
import { DomainError } from '../middleware/errorHandler';
import { prisma } from '../prismaClient';

const TEST_KEY_ID = 'rzp_test_valid_key_123';
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

describe('PaymentModule - Full Security, Fail-Closed & Atomicity Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('TEST 1: Missing RAZORPAY_KEY_ID throws ERR_RAZORPAY_CONFIG (500) and prevents all database mutations', async () => {
    delete process.env.RAZORPAY_KEY_ID;

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: 'sig_1',
        amount: 100,
        bookingId: 'bk-1',
      });
      fail('Should have thrown ERR_RAZORPAY_CONFIG');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_CONFIG');
      expect(err.statusCode).toBe(500);
      expect(err.message).toContain('Razorpay key ID is not configured');
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 2: Empty RAZORPAY_KEY_ID throws ERR_RAZORPAY_CONFIG (500) and prevents order creation & payment verification', async () => {
    process.env.RAZORPAY_KEY_ID = '';

    await expect(PaymentModule.createRazorpayOrder(500)).rejects.toThrow(DomainError);

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_2',
        razorpayPaymentId: 'pay_2',
        razorpaySignature: 'sig_2',
        amount: 200,
        bookingId: 'bk-2',
      });
      fail('Should have thrown ERR_RAZORPAY_CONFIG');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_CONFIG');
      expect(err.statusCode).toBe(500);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 3: Whitespace-only RAZORPAY_KEY_ID throws ERR_RAZORPAY_CONFIG (500) and prevents database mutation', async () => {
    process.env.RAZORPAY_KEY_ID = '   \t\n  ';

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_3',
        razorpayPaymentId: 'pay_3',
        razorpaySignature: 'sig_3',
        amount: 300,
        bookingId: 'bk-3',
      });
      fail('Should have thrown ERR_RAZORPAY_CONFIG');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_CONFIG');
      expect(err.statusCode).toBe(500);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 4: Missing RAZORPAY_KEY_SECRET throws ERR_RAZORPAY_CONFIG (500) and prevents all database mutations', async () => {
    delete process.env.RAZORPAY_KEY_SECRET;

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_4',
        razorpayPaymentId: 'pay_4',
        razorpaySignature: 'sig_4',
        amount: 400,
        bookingId: 'bk-4',
      });
      fail('Should have thrown ERR_RAZORPAY_CONFIG');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_CONFIG');
      expect(err.statusCode).toBe(500);
      expect(err.message).toContain('Razorpay secret key is not configured');
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 5: Empty/whitespace RAZORPAY_KEY_SECRET throws ERR_RAZORPAY_CONFIG (500) and prevents mutation', async () => {
    process.env.RAZORPAY_KEY_SECRET = '   ';

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_5',
        razorpayPaymentId: 'pay_5',
        razorpaySignature: 'sig_5',
        amount: 500,
        bookingId: 'bk-5',
      });
      fail('Should have thrown ERR_RAZORPAY_CONFIG');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_CONFIG');
      expect(err.statusCode).toBe(500);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 6: Valid Key ID + valid Secret + valid HMAC successfully verifies payment, updates booking to CONFIRMED and creates Payment SUCCESS', async () => {
    const orderId = 'order_6';
    const paymentId = 'pay_6';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-6', status: 'PENDING', razorpayPaid: 600.0 };
    const mockCreatedPayment = {
      id: 'pay-db-6',
      bookingId: 'bk-6',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 600.0,
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
      amount: 600.0,
      bookingId: 'bk-6',
    });

    expect(result).toEqual(mockCreatedPayment);
    expect(mockTxBookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'bk-6', status: 'PENDING' },
      data: { status: 'CONFIRMED' },
    });
    expect(mockTxPaymentCreate).toHaveBeenCalled();
  });

  it('TEST 7: Invalid HMAC throws ERR_RAZORPAY_VERIFY_FAILED (400) and transaction is never entered', async () => {
    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_7',
        razorpayPaymentId: 'pay_7',
        razorpaySignature: 'invalid_hmac_signature_hex_123',
        amount: 700,
        bookingId: 'bk-7',
      });
      fail('Should have thrown ERR_RAZORPAY_VERIFY_FAILED');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_VERIFY_FAILED');
      expect(err.statusCode).toBe(400);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 8: NODE_ENV=development + invalid HMAC is STILL rejected with ERR_RAZORPAY_VERIFY_FAILED', async () => {
    process.env.NODE_ENV = 'development';

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_8',
        razorpayPaymentId: 'pay_8',
        razorpaySignature: 'bogus_dev_signature',
        amount: 800,
        bookingId: 'bk-8',
      });
      fail('Should have rejected invalid HMAC in NODE_ENV=development');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_VERIFY_FAILED');
      expect(err.statusCode).toBe(400);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 9: NODE_ENV=production + invalid HMAC is STILL rejected with ERR_RAZORPAY_VERIFY_FAILED', async () => {
    process.env.NODE_ENV = 'production';

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_9',
        razorpayPaymentId: 'pay_9',
        razorpaySignature: 'bogus_prod_signature',
        amount: 900,
        bookingId: 'bk-9',
      });
      fail('Should have rejected invalid HMAC in NODE_ENV=production');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_RAZORPAY_VERIFY_FAILED');
      expect(err.statusCode).toBe(400);
    }

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('TEST 10: Existing razorpayPaymentId remains idempotent and returns existing payment record', async () => {
    const orderId = 'order_10';
    const paymentId = 'pay_10_dup';
    const validSig = generateValidSignature(orderId, paymentId);

    const existingPaymentRecord = { id: 'pay-existing-10', razorpayPaymentId: paymentId, amount: 1000.0, status: 'SUCCESS' };
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
      amount: 1000.0,
      bookingId: 'bk-10',
    });

    expect(result).toEqual(existingPaymentRecord);
    expect(mockTxBookingUpdateMany).not.toHaveBeenCalled();
    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 11: Payment amount mismatch throws ERR_PAYMENT_AMOUNT_MISMATCH (400) and commits zero payment', async () => {
    const orderId = 'order_11';
    const paymentId = 'pay_11';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-11', status: 'PENDING', razorpayPaid: 1000.0 };
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
        amount: 500.0, // Tampered amount (500 vs 1000)
        bookingId: 'bk-11',
      });
      fail('Should have thrown ERR_PAYMENT_AMOUNT_MISMATCH');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_PAYMENT_AMOUNT_MISMATCH');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 12: Expired booking with valid signature throws ERR_BOOKING_EXPIRED (400) and commits zero payment', async () => {
    const orderId = 'order_12';
    const paymentId = 'pay_12';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockExpiredBooking = { id: 'bk-12', status: 'EXPIRED', razorpayPaid: 350.0 };
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
        bookingId: 'bk-12',
      });
      fail('Should have thrown ERR_BOOKING_EXPIRED');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_BOOKING_EXPIRED');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 13: Completed booking with valid signature throws ERR_BOOKING_ALREADY_COMPLETED (400) and commits zero payment', async () => {
    const orderId = 'order_13';
    const paymentId = 'pay_13';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockCompletedBooking = { id: 'bk-13', status: 'COMPLETED', razorpayPaid: 450.0 };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockCompletedBooking), updateMany: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 450.0,
        bookingId: 'bk-13',
      });
      fail('Should have thrown ERR_BOOKING_ALREADY_COMPLETED');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_BOOKING_ALREADY_COMPLETED');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 14: Database failure inside transaction rolls back entire transaction with zero payment creation', async () => {
    const orderId = 'order_14';
    const paymentId = 'pay_14';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-14', status: 'PENDING', razorpayPaid: 250.0 };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), updateMany: jest.fn().mockRejectedValue(new Error('Database write failure')) },
      };
      return cb(tx);
    });

    await expect(
      PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 250.0,
        bookingId: 'bk-14',
      })
    ).rejects.toThrow('Database write failure');

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 15: Concurrent payment verification vs expiration race (updateMany count === 0 after expiration wins) throws ERR_BOOKING_EXPIRED and creates no payment', async () => {
    const orderId = 'order_15';
    const paymentId = 'pay_15';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockInitialBooking = { id: 'bk-15', status: 'PENDING', razorpayPaid: 350.0 };
    const mockExpiredRecheck = { id: 'bk-15', status: 'EXPIRED', razorpayPaid: 350.0 };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      let findCount = 0;
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: {
          findUnique: jest.fn().mockImplementation(async () => {
            findCount++;
            return findCount === 1 ? mockInitialBooking : mockExpiredRecheck;
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }), // Lost race to expiration
        },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 350.0,
        bookingId: 'bk-15',
      });
      fail('Should have thrown ERR_BOOKING_EXPIRED');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_BOOKING_EXPIRED');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 16: Transaction ID confirmation marks store transaction status COMPLETED inside payment transaction', async () => {
    const orderId = 'order_16';
    const paymentId = 'pay_16';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockTransaction = { id: 'tx-store-16', finalPaidAmount: 850.0, status: 'PENDING' };
    const mockCreatedPayment = { id: 'pay-tx-16', transactionId: 'tx-store-16', amount: 850.0, status: 'SUCCESS' };
    const mockTxUpdate = jest.fn().mockResolvedValue({ count: 1 });
    const mockTxPaymentCreate = jest.fn().mockResolvedValue(mockCreatedPayment);

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        transaction: { findUnique: jest.fn().mockResolvedValue(mockTransaction), update: mockTxUpdate },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 850.0,
      transactionId: 'tx-store-16',
    });

    expect(result).toEqual(mockCreatedPayment);
    expect(mockTxUpdate).toHaveBeenCalledWith({
      where: { id: 'tx-store-16' },
      data: { status: 'COMPLETED' },
    });
  });

  it('TEST 17: createRazorpayOrder succeeds with configured RAZORPAY_KEY_ID', async () => {
    const order = await PaymentModule.createRazorpayOrder(1500.0);
    expect(order.amount).toBe(1500.0);
    expect(order.keyId).toBe(TEST_KEY_ID);
    expect(order.razorpayOrderId).toMatch(/^order_/);
  });
});
