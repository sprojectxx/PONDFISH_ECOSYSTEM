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
        findFirst: jest.fn(),
        update: jest.fn(),
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

describe('PaymentModule - Full Security, Order Binding & Atomicity Regression Suite', () => {
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

  it('TEST L: Missing RAZORPAY_KEY_ID throws ERR_RAZORPAY_CONFIG (500) and prevents all database mutations', async () => {
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

  it('TEST 2: Empty RAZORPAY_KEY_ID throws ERR_RAZORPAY_CONFIG (500)', async () => {
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

  it('TEST K: Invalid HMAC signature throws ERR_RAZORPAY_VERIFY_FAILED (400) and transaction is never entered', async () => {
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

  it('TEST A: Valid HMAC + valid Razorpay order/payment + correct booking -> SUCCESS', async () => {
    const orderId = 'order_bound_001';
    const paymentId = 'pay_bound_001';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-A', customerId: 'cust-1', status: 'PENDING', razorpayPaid: 600.0, razorpayOrderId: orderId };
    const mockCreatedPayment = {
      id: 'pay-db-A',
      bookingId: 'bk-A',
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
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), findFirst: jest.fn(), updateMany: mockTxBookingUpdateMany },
        transaction: { findUnique: jest.fn(), update: jest.fn() },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 600.0,
      bookingId: 'bk-A',
      customerId: 'cust-1',
    });

    expect(result).toEqual(mockCreatedPayment);
    expect(mockTxBookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'bk-A', status: 'PENDING' },
      data: { status: 'CONFIRMED' },
    });
    expect(mockTxPaymentCreate).toHaveBeenCalled();
  });

  it('TEST B: Valid HMAC + Razorpay order belonging to Booking A + submitted Booking B -> ERR_PAYMENT_BOOKING_MISMATCH and zero payment creation', async () => {
    const orderIdA = 'order_belonging_to_booking_A';
    const paymentId = 'pay_attack_001';
    const validSig = generateValidSignature(orderIdA, paymentId);

    // Victim Booking B has razorpayOrderId 'order_belonging_to_booking_B'
    const mockBookingB = {
      id: 'bk-B',
      customerId: 'cust-victim',
      status: 'PENDING',
      razorpayPaid: 500.0,
      razorpayOrderId: 'order_belonging_to_booking_B',
    };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBookingB), findFirst: jest.fn(), updateMany: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderIdA, // Submitted order_A
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 500.0,
        bookingId: 'bk-B', // Submitted victim booking_B
      });
      fail('Should have thrown ERR_PAYMENT_BOOKING_MISMATCH');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_PAYMENT_BOOKING_MISMATCH');
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Razorpay order ID does not match');
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST B2: Order A assigned to Booking A in DB when Booking B has null razorpayOrderId -> ERR_PAYMENT_BOOKING_MISMATCH', async () => {
    const orderIdA = 'order_assigned_to_A';
    const paymentId = 'pay_attack_002';
    const validSig = generateValidSignature(orderIdA, paymentId);

    const mockBookingB = { id: 'bk-B', customerId: 'cust-2', status: 'PENDING', razorpayPaid: 500.0, razorpayOrderId: null };
    const mockBookingA = { id: 'bk-A', customerId: 'cust-1', status: 'PENDING', razorpayPaid: 500.0, razorpayOrderId: orderIdA };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBookingB),
          findFirst: jest.fn().mockResolvedValue(mockBookingA), // Found bound to Booking A!
          updateMany: jest.fn(),
        },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderIdA,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 500.0,
        bookingId: 'bk-B',
      });
      fail('Should have thrown ERR_PAYMENT_BOOKING_MISMATCH');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_PAYMENT_BOOKING_MISMATCH');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST C: Valid payment + wrong transactionId -> ERR_PAYMENT_BOOKING_MISMATCH', async () => {
    const orderId = 'order_tx_mismatch';
    const paymentId = 'pay_tx_mismatch';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-C', status: 'PENDING', razorpayPaid: 300.0, razorpayOrderId: orderId };
    const mockTransactionForOtherBooking = { id: 'tx-other', bookingId: 'bk-OTHER', customerId: 'cust-1', finalPaidAmount: 300.0 };
    const mockTxBookingUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), findFirst: jest.fn(), updateMany: mockTxBookingUpdateMany },
        transaction: { findUnique: jest.fn().mockResolvedValue(mockTransactionForOtherBooking), update: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 300.0,
        bookingId: 'bk-C',
        transactionId: 'tx-other',
      });
      fail('Should have thrown ERR_PAYMENT_BOOKING_MISMATCH');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_PAYMENT_BOOKING_MISMATCH');
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Transaction does not belong to the specified booking');
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST D: Customer A attempts to verify payment for Customer B booking -> ERR_FORBIDDEN (403)', async () => {
    const orderId = 'order_cust_mismatch';
    const paymentId = 'pay_cust_mismatch';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBookingOfCustomerB = { id: 'bk-B', customerId: 'cust-B', status: 'PENDING', razorpayPaid: 400.0, razorpayOrderId: orderId };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBookingOfCustomerB), findFirst: jest.fn(), updateMany: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 400.0,
        bookingId: 'bk-B',
        customerId: 'cust-A', // Attacker Customer A
      });
      fail('Should have thrown ERR_FORBIDDEN');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_FORBIDDEN');
      expect(err.statusCode).toBe(403);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST E: Same Razorpay payment ID submitted twice for same booking -> Idempotent success', async () => {
    const orderId = 'order_idem_01';
    const paymentId = 'pay_idem_01';
    const validSig = generateValidSignature(orderId, paymentId);

    const existingPaymentRecord = {
      id: 'pay-existing-10',
      bookingId: 'bk-idem',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      amount: 1000.0,
      status: 'SUCCESS',
    };
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
      bookingId: 'bk-idem',
    });

    expect(result).toEqual(existingPaymentRecord);
    expect(mockTxBookingUpdateMany).not.toHaveBeenCalled();
    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST F: Same Razorpay payment ID submitted for a DIFFERENT booking -> ERR_PAYMENT_BOOKING_MISMATCH', async () => {
    const orderId = 'order_idem_02';
    const paymentId = 'pay_idem_02';
    const validSig = generateValidSignature(orderId, paymentId);

    const existingPaymentForBookingA = {
      id: 'pay-existing-A',
      bookingId: 'bk-A',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      amount: 800.0,
      status: 'SUCCESS',
    };

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(existingPaymentForBookingA), create: jest.fn() },
        booking: { findUnique: jest.fn(), updateMany: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 800.0,
        bookingId: 'bk-B', // Different booking submitted!
      });
      fail('Should have thrown ERR_PAYMENT_BOOKING_MISMATCH');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_PAYMENT_BOOKING_MISMATCH');
      expect(err.statusCode).toBe(400);
    }
  });

  it('TEST I: Payment amount mismatch throws ERR_PAYMENT_AMOUNT_MISMATCH (400) and commits zero payment', async () => {
    const orderId = 'order_11';
    const paymentId = 'pay_11';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-11', status: 'PENDING', razorpayPaid: 1000.0, razorpayOrderId: orderId };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), findFirst: jest.fn(), updateMany: jest.fn() },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 500.0, // Tampered amount
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

  it('TEST H: Expired booking with valid signature throws ERR_BOOKING_EXPIRED (400) and commits zero payment', async () => {
    const orderId = 'order_12';
    const paymentId = 'pay_12';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockExpiredBooking = { id: 'bk-12', status: 'EXPIRED', razorpayPaid: 350.0, razorpayOrderId: orderId };
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockExpiredBooking), findFirst: jest.fn(), updateMany: jest.fn() },
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

  it('TEST J: Database failure after transactional booking mutation propagates error cleanly', async () => {
    const orderId = 'order_14';
    const paymentId = 'pay_14';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = { id: 'bk-14', status: 'PENDING', razorpayPaid: 250.0, razorpayOrderId: orderId };
    const mockTxBookingUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const mockTxPaymentCreate = jest.fn().mockRejectedValue(new Error('Database write failure on payment creation'));

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: { findUnique: jest.fn().mockResolvedValue(null), create: mockTxPaymentCreate },
        booking: { findUnique: jest.fn().mockResolvedValue(mockBooking), findFirst: jest.fn(), updateMany: mockTxBookingUpdateMany },
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
    ).rejects.toThrow('Database write failure on payment creation');

    expect(mockTxBookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'bk-14', status: 'PENDING' },
      data: { status: 'CONFIRMED' },
    });
    expect(mockTxPaymentCreate).toHaveBeenCalled();
  });

  it('TEST M: createRazorpayOrder derives authoritative amount from booking.razorpayPaid and binds razorpayOrderId in DB', async () => {
    const mockBooking = {
      id: 'bk-M',
      customerId: 'cust-1',
      status: 'PENDING',
      razorpayPaid: 1250.0,
    };

    (prisma.booking.findUnique as jest.Mock).mockResolvedValueOnce(mockBooking);
    (prisma.booking.update as jest.Mock).mockResolvedValueOnce({ ...mockBooking, razorpayOrderId: 'order_test_M' });

    const order = await PaymentModule.createRazorpayOrder({
      bookingId: 'bk-M',
      customerId: 'cust-1',
    });

    expect(order.amount).toBe(1250.0);
    expect(order.keyId).toBe(TEST_KEY_ID);
    expect(order.razorpayOrderId).toMatch(/^order_/);
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'bk-M' },
      data: { razorpayOrderId: order.razorpayOrderId },
    });
  });
});
