import crypto from 'crypto';
import { PaymentModule } from '../modules/paymentModule';
import { DomainError } from '../middleware/errorHandler';
import { prisma } from '../prismaClient';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key';

function generateValidSignature(orderId: string, paymentId: string): string {
  return crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
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

describe('PaymentModule - Atomicity & Concurrency Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TEST 1: Successful payment verification transitions PENDING booking to CONFIRMED and creates payment inside transaction', async () => {
    const orderId = 'order_123';
    const paymentId = 'pay_123';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = {
      id: 'bk-pending-123',
      status: 'PENDING',
      razorpayPaid: 500.0,
    };

    const mockPaymentCreated = {
      id: 'pay-1',
      bookingId: 'bk-pending-123',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 500.0,
      method: 'RAZORPAY',
      status: 'SUCCESS',
    };

    const mockTxBookingUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const mockTxPaymentCreate = jest.fn().mockResolvedValue(mockPaymentCreated);

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: mockTxPaymentCreate,
        },
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBooking),
          updateMany: mockTxBookingUpdateMany,
        },
        transaction: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 500.0,
      bookingId: 'bk-pending-123',
    });

    expect(result).toEqual(mockPaymentCreated);
    expect(mockTxBookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'bk-pending-123', status: 'PENDING' },
      data: { status: 'CONFIRMED' },
    });
    expect(mockTxPaymentCreate).toHaveBeenCalled();
  });

  it('TEST 2: Expired booking causes payment verification to throw ERR_BOOKING_EXPIRED and roll back without committing Payment', async () => {
    const orderId = 'order_456';
    const paymentId = 'pay_456';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockExpiredBooking = {
      id: 'bk-expired-456',
      status: 'EXPIRED',
      razorpayPaid: 300.0,
    };

    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: mockTxPaymentCreate,
        },
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockExpiredBooking),
          updateMany: jest.fn(),
        },
      };
      return cb(tx);
    });

    await expect(
      PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 300.0,
        bookingId: 'bk-expired-456',
      })
    ).rejects.toThrow(DomainError);

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 3: Completed booking causes payment verification to throw ERR_BOOKING_ALREADY_COMPLETED without creating payment', async () => {
    const orderId = 'order_789';
    const paymentId = 'pay_789';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockCompletedBooking = {
      id: 'bk-completed-789',
      status: 'COMPLETED',
      razorpayPaid: 400.0,
    };

    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: mockTxPaymentCreate,
        },
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockCompletedBooking),
          updateMany: jest.fn(),
        },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 400.0,
        bookingId: 'bk-completed-789',
      });
      fail('Should have thrown ERR_BOOKING_ALREADY_COMPLETED');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_BOOKING_ALREADY_COMPLETED');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 4: Database failure during booking update causes complete transaction rollback with zero payment creation', async () => {
    const orderId = 'order_101';
    const paymentId = 'pay_101';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = {
      id: 'bk-db-fail-101',
      status: 'PENDING',
      razorpayPaid: 250.0,
    };

    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: mockTxPaymentCreate,
        },
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBooking),
          updateMany: jest.fn().mockRejectedValue(new Error('Database write failure')),
        },
      };
      return cb(tx);
    });

    await expect(
      PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 250.0,
        bookingId: 'bk-db-fail-101',
      })
    ).rejects.toThrow('Database write failure');

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 5: Duplicate razorpayPaymentId returns existing payment without creating duplicate payment or re-mutating booking', async () => {
    const orderId = 'order_999';
    const paymentId = 'pay_dup_999';
    const validSig = generateValidSignature(orderId, paymentId);

    const existingPaymentRecord = {
      id: 'pay-existing-999',
      razorpayPaymentId: paymentId,
      amount: 600.0,
      status: 'SUCCESS',
    };

    const mockTxBookingUpdateMany = jest.fn();
    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(existingPaymentRecord),
          create: mockTxPaymentCreate,
        },
        booking: {
          findUnique: jest.fn(),
          updateMany: mockTxBookingUpdateMany,
        },
      };
      return cb(tx);
    });

    const result = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSig,
      amount: 600.0,
      bookingId: 'bk-some-id',
    });

    expect(result).toEqual(existingPaymentRecord);
    expect(mockTxBookingUpdateMany).not.toHaveBeenCalled();
    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 6: Payment amount mismatch throws ERR_PAYMENT_AMOUNT_MISMATCH and creates no payment', async () => {
    const orderId = 'order_202';
    const paymentId = 'pay_202';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockBooking = {
      id: 'bk-mismatch-202',
      status: 'PENDING',
      razorpayPaid: 1000.0, // Expected 1000
    };

    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: mockTxPaymentCreate,
        },
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBooking),
          updateMany: jest.fn(),
        },
      };
      return cb(tx);
    });

    try {
      await PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
        amount: 500.0, // Tampered/mismatched amount (500 vs 1000)
        bookingId: 'bk-mismatch-202',
      });
      fail('Should have thrown ERR_PAYMENT_AMOUNT_MISMATCH');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_PAYMENT_AMOUNT_MISMATCH');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 7: Concurrent payment verification vs expiration race (updateMany count === 0 after expiration wins) throws ERR_BOOKING_EXPIRED and creates no payment', async () => {
    const orderId = 'order_303';
    const paymentId = 'pay_303';
    const validSig = generateValidSignature(orderId, paymentId);

    const mockInitialBooking = {
      id: 'bk-race-303',
      status: 'PENDING',
      razorpayPaid: 350.0,
    };

    const mockExpiredRecheck = {
      id: 'bk-race-303',
      status: 'EXPIRED',
      razorpayPaid: 350.0,
    };

    const mockTxPaymentCreate = jest.fn();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      let findCount = 0;
      const tx = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: mockTxPaymentCreate,
        },
        booking: {
          findUnique: jest.fn().mockImplementation(async () => {
            findCount++;
            return findCount === 1 ? mockInitialBooking : mockExpiredRecheck;
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }), // CAS lost race to expiration
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
        bookingId: 'bk-race-303',
      });
      fail('Should have thrown ERR_BOOKING_EXPIRED');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_BOOKING_EXPIRED');
      expect(err.statusCode).toBe(400);
    }

    expect(mockTxPaymentCreate).not.toHaveBeenCalled();
  });

  it('TEST 8: Invalid Razorpay signature throws ERR_RAZORPAY_VERIFY_FAILED before starting transaction', async () => {
    const mockTxPaymentCreate = jest.fn();

    await expect(
      PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: 'order_bad',
        razorpayPaymentId: 'pay_bad',
        razorpaySignature: 'invalid_signature_hash',
        amount: 100.0,
        bookingId: 'bk-bad-sig',
      })
    ).rejects.toThrow(DomainError);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
