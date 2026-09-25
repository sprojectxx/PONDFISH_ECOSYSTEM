import crypto from 'crypto';
import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

function validateRazorpayConfig(): { keyId: string; secret: string } {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || secret.trim() === '') {
    throw new DomainError('ERR_RAZORPAY_CONFIG', 'Razorpay secret key is not configured on the server.', 500);
  }
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId || keyId.trim() === '') {
    throw new DomainError('ERR_RAZORPAY_CONFIG', 'Razorpay key ID is not configured on the server.', 500);
  }
  return { keyId, secret };
}

function safeTimingEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export interface CreateOrderParams {
  amount?: number;
  bookingId?: string;
  transactionId?: string;
  customerId?: string;
  currency?: string;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  transactionId?: string;
  bookingId?: string;
  customerId?: string;
}

export class PaymentModule {
  static async createRazorpayOrder(
    input: number | CreateOrderParams,
    currencyOverride = 'INR'
  ) {
    const { keyId } = validateRazorpayConfig();

    let amount: number | undefined;
    let bookingId: string | undefined;
    let transactionId: string | undefined;
    let customerId: string | undefined;
    let currency = currencyOverride;

    if (typeof input === 'number') {
      amount = input;
    } else if (input && typeof input === 'object') {
      amount = input.amount;
      bookingId = input.bookingId;
      transactionId = input.transactionId;
      customerId = input.customerId;
      if (input.currency) currency = input.currency;
    }

    let authoritativeAmount = amount || 0;

    // Server-side authoritative validation & binding for Booking
    if (bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        throw new DomainError('ERR_BOOKING_NOT_FOUND', 'Booking not found.', 404);
      }

      if (customerId && booking.customerId !== customerId) {
        throw new DomainError('ERR_FORBIDDEN', 'Access denied to target booking.', 403);
      }

      if (booking.status === 'EXPIRED') {
        throw new DomainError('ERR_BOOKING_EXPIRED', 'Cannot create payment order. Booking has expired.', 400);
      }

      if (booking.status === 'COMPLETED') {
        throw new DomainError('ERR_BOOKING_ALREADY_COMPLETED', 'Cannot create payment order. Booking is already completed.', 400);
      }

      if (booking.status !== 'PENDING') {
        throw new DomainError('ERR_BOOKING_NOT_PENDING', `Booking cannot accept payment from status: ${booking.status}.`, 400);
      }

      authoritativeAmount = booking.razorpayPaid;
      if (authoritativeAmount <= 0) {
        throw new DomainError('ERR_INVALID_INPUT', 'Booking requires zero online payment.', 400);
      }
    } else if (transactionId) {
      const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
      if (!transaction) {
        throw new DomainError('ERR_TRANSACTION_NOT_FOUND', 'Transaction not found.', 404);
      }

      if (customerId && transaction.customerId !== customerId) {
        throw new DomainError('ERR_FORBIDDEN', 'Access denied to target transaction.', 403);
      }

      authoritativeAmount = transaction.finalPaidAmount;
    }

    const razorpayOrderId = 'order_' + Math.random().toString(36).substring(2, 12);

    // Bind razorpayOrderId server-side in DB if bookingId is provided
    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { razorpayOrderId },
      });
    }

    return {
      razorpayOrderId,
      amount: authoritativeAmount,
      currency,
      keyId,
    };
  }

  static async verifyRazorpayPayment(data: VerifyPaymentParams) {
    // Fail-closed configuration check
    const { secret } = validateRazorpayConfig();

    // Signature verification hash: hmac_sha256(order_id + "|" + payment_id, secret)
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(data.razorpayOrderId + '|' + data.razorpayPaymentId)
      .digest('hex');

    // Strict timing-safe HMAC signature verification (no development bypass)
    const isValid = safeTimingEqual(generatedSignature, data.razorpaySignature);
    if (!isValid) {
      throw new DomainError('ERR_RAZORPAY_VERIFY_FAILED', 'Razorpay payment signature verification failed.', 400);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Idempotency check inside transaction
      if (data.razorpayPaymentId) {
        const existingPayment = await tx.payment.findUnique({
          where: { razorpayPaymentId: data.razorpayPaymentId },
        });

        if (existingPayment) {
          if (data.bookingId && existingPayment.bookingId && existingPayment.bookingId !== data.bookingId) {
            throw new DomainError('ERR_PAYMENT_BOOKING_MISMATCH', 'Razorpay payment ID belongs to a different booking.', 400);
          }
          return existingPayment;
        }
      }

      // Payment confirmation & binding: update associated Booking status
      if (data.bookingId) {
        const booking = await tx.booking.findUnique({ where: { id: data.bookingId } });
        if (!booking) {
          throw new DomainError('ERR_BOOKING_NOT_FOUND', 'Booking not found.', 404);
        }

        if (data.customerId && booking.customerId !== data.customerId) {
          throw new DomainError('ERR_FORBIDDEN', 'Access denied to target booking.', 403);
        }

        if (booking.status === 'EXPIRED') {
          throw new DomainError('ERR_BOOKING_EXPIRED', 'Cannot confirm payment. Booking has expired (48h window passed).', 400);
        }

        if (booking.status === 'COMPLETED') {
          throw new DomainError('ERR_BOOKING_ALREADY_COMPLETED', 'Booking is already marked complete.', 400);
        }

        if (booking.status === 'CANCELLED') {
          throw new DomainError('ERR_BOOKING_CANCELLED', 'Booking is cancelled.', 400);
        }

        // STRICT ORDER-TO-BOOKING BINDING CHECK
        if (booking.razorpayOrderId) {
          if (booking.razorpayOrderId !== data.razorpayOrderId) {
            throw new DomainError('ERR_PAYMENT_BOOKING_MISMATCH', 'Submitted Razorpay order ID does not match the target booking.', 400);
          }
        } else {
          // If booking has no orderId bound, verify orderId is not assigned to another booking
          const boundToOther = await tx.booking.findFirst({
            where: { razorpayOrderId: data.razorpayOrderId, id: { not: data.bookingId } },
          });

          if (boundToOther) {
            throw new DomainError('ERR_PAYMENT_BOOKING_MISMATCH', 'Submitted Razorpay order ID belongs to a different booking.', 400);
          }

          // Bind orderId to booking
          await tx.booking.update({
            where: { id: data.bookingId },
            data: { razorpayOrderId: data.razorpayOrderId },
          });
        }

        // Amount verification against authoritative booking razorpayPaid field
        if (booking.razorpayPaid > 0 && Math.abs(data.amount - booking.razorpayPaid) > 0.01) {
          throw new DomainError(
            'ERR_PAYMENT_AMOUNT_MISMATCH',
            `Paid amount (${data.amount}) does not match expected booking amount (${booking.razorpayPaid}).`,
            400
          );
        }

        const updated = await tx.booking.updateMany({
          where: { id: data.bookingId, status: 'PENDING' },
          data: { status: 'CONFIRMED' },
        });

        if (updated.count === 0) {
          const rechecked = await tx.booking.findUnique({ where: { id: data.bookingId } });
          if (rechecked?.status === 'EXPIRED') {
            throw new DomainError('ERR_BOOKING_EXPIRED', 'Cannot confirm payment. Booking has expired (48h window passed).', 400);
          }
          if (rechecked?.status === 'COMPLETED') {
            throw new DomainError('ERR_BOOKING_ALREADY_COMPLETED', 'Booking is already marked complete.', 400);
          }
          throw new DomainError('ERR_BOOKING_NOT_PENDING', `Booking cannot be confirmed from status: ${rechecked?.status}.`, 400);
        }
      }

      // Payment confirmation & binding: update associated Transaction status
      if (data.transactionId) {
        const transaction = await tx.transaction.findUnique({ where: { id: data.transactionId } });
        if (!transaction) {
          throw new DomainError('ERR_TRANSACTION_NOT_FOUND', 'Transaction not found.', 404);
        }

        if (data.customerId && transaction.customerId !== data.customerId) {
          throw new DomainError('ERR_FORBIDDEN', 'Access denied to target transaction.', 403);
        }

        if (data.bookingId && transaction.bookingId !== data.bookingId) {
          throw new DomainError('ERR_PAYMENT_BOOKING_MISMATCH', 'Transaction does not belong to the specified booking.', 400);
        }

        if (transaction.finalPaidAmount > 0 && Math.abs(data.amount - transaction.finalPaidAmount) > 0.01) {
          throw new DomainError(
            'ERR_PAYMENT_AMOUNT_MISMATCH',
            `Paid amount (${data.amount}) does not match expected transaction amount (${transaction.finalPaidAmount}).`,
            400
          );
        }

        await tx.transaction.update({
          where: { id: data.transactionId },
          data: { status: 'COMPLETED' },
        });
      }

      // Create Payment record strictly inside transaction AFTER state mutations succeed
      const payment = await tx.payment.create({
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
    });
  }

  static verifyRazorpayWebhookSignature(rawBody: string | Buffer | any, signature: string): boolean {
    let secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || secret.trim() === '') {
      if (process.env.NODE_ENV === 'production') {
        throw new DomainError('ERR_RAZORPAY_CONFIG', 'CRITICAL: RAZORPAY_WEBHOOK_SECRET environment variable is missing in production environment.', 500);
      }
      secret = 'rzp_test_webhook_secret';
    }

    if (!signature || !rawBody) return false;

    const payloadString: string | Buffer =
      typeof rawBody === 'string' || Buffer.isBuffer(rawBody)
        ? rawBody
        : JSON.stringify(rawBody);

    const expected = crypto.createHmac('sha256', secret.trim()).update(payloadString).digest('hex');
    return safeTimingEqual(expected, signature);
  }

  static async handleRazorpayWebhook(rawBody: string | Buffer, signature: string, payload: any) {
    // 1. Raw-body HMAC signature verification
    const isValid = this.verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new DomainError('ERR_INVALID_WEBHOOK_SIGNATURE', 'Razorpay webhook HMAC signature verification failed.', 400);
    }

    const eventId = payload?.event_id || payload?.id;
    const eventType = payload?.event || 'unknown';

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 2. Database-backed event idempotency check via webhook_events unique index
      if (eventId) {
        try {
          await tx.webhookEvent.create({
            data: {
              eventId,
              eventType,
            },
          });
        } catch (err: any) {
          if (err.code === 'P2002') {
            return {
              status: 'ALREADY_PROCESSED',
              eventId,
              eventType,
              message: 'Webhook event already processed (idempotent).',
            };
          }
          throw err;
        }
      }

      // 3. Conservative event handling
      if (['payment.captured', 'payment.authorized', 'order.paid'].includes(eventType)) {
        const paymentEntity = payload?.payload?.payment?.entity || payload?.payload?.order?.entity;
        const razorpayOrderId = paymentEntity?.order_id || paymentEntity?.id;
        const razorpayPaymentId = paymentEntity?.id;

        if (!razorpayOrderId) {
          return { status: 'IGNORED', eventType, message: 'Missing order_id in webhook payload.' };
        }

        // Find associated booking
        const booking = await tx.booking.findFirst({ where: { razorpayOrderId } });
        if (!booking) {
          return { status: 'IGNORED', eventType, message: `No booking found bound to Razorpay order ${razorpayOrderId}.` };
        }

        // Amount parsing (Razorpay sends amount in paise: 100000 = 1000.0)
        let rawAmount = paymentEntity?.amount;
        let amount = typeof rawAmount === 'number' ? rawAmount : booking.razorpayPaid;
        if (amount > 100 && amount === Math.round(booking.razorpayPaid * 100)) {
          amount = booking.razorpayPaid;
        }

        // Confirm booking PENDING -> CONFIRMED inside the transaction
        if (booking.status === 'PENDING') {
          await tx.booking.updateMany({
            where: { id: booking.id, status: 'PENDING' },
            data: { status: 'CONFIRMED' },
          });

          // Create payment record if not present
          const existingPayment = await tx.payment.findFirst({
            where: { razorpayOrderId },
          });

          if (!existingPayment) {
            await tx.payment.create({
              data: {
                bookingId: booking.id,
                razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId || `pay_wh_${Date.now()}`,
                amount,
                method: 'RAZORPAY',
                status: 'SUCCESS',
              },
            });
          }

          return { status: 'PROCESSED', eventType, bookingId: booking.id, bookingStatus: 'CONFIRMED' };
        } else {
          return { status: 'IDEMPOTENT_SUCCESS', eventType, bookingId: booking.id, bookingStatus: booking.status };
        }
      }

      // Safe acknowledgement for unsupported event types
      return {
        status: 'IGNORED',
        eventType,
        message: `Webhook event '${eventType}' acknowledged and ignored without business state mutation.`,
      };
    });
  }
}
