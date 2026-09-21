import crypto from 'crypto';
import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key';

export class PaymentModule {
  static async createRazorpayOrder(amount: number, currency = 'INR') {
    const razorpayOrderId = 'order_' + Math.random().toString(36).substring(2, 12);
    return {
      razorpayOrderId,
      amount,
      currency,
      keyId: RAZORPAY_KEY_ID,
    };
  }

  static async verifyRazorpayPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
    transactionId?: string;
    bookingId?: string;
  }) {
    // Idempotency check: Ensure payment hasn't already been processed
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayPaymentId: data.razorpayPaymentId },
    });

    if (existingPayment) {
      return existingPayment;
    }

    // Signature verification hash: hmac_sha256(order_id + "|" + payment_id, secret)
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(data.razorpayOrderId + '|' + data.razorpayPaymentId)
      .digest('hex');

    // In dev environment with mock secret, accept signature if equal or mock mode
    const isValid = process.env.NODE_ENV === 'development' || generatedSignature === data.razorpaySignature;
    if (!isValid) {
      throw new DomainError('ERR_RAZORPAY_VERIFY_FAILED', 'Razorpay payment signature verification failed.', 400);
    }

    const payment = await prisma.payment.create({
      data: {
        transactionId: data.transactionId || null,
        bookingId: data.bookingId || null,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        amount: data.amount,
        method: 'RAZORPAY',
        status: 'SUCCESS',
      },
    });

    return payment;
  }
}
