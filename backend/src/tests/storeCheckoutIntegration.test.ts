/**
 * INTEGRATION TEST SUITE: Store Checkout & Concurrency
 *
 * NOTE: This test suite requires a live, active PostgreSQL database instance.
 * When DATABASE_URL is not connected or live PostgreSQL is unavailable,
 * integration tests in this suite are gracefully skipped with a warning.
 *
 * REAL POSTGRESQL + APPLICATION PAYMENT LOGIC (NOT LIVE RAZORPAY GATEWAY)
 */

import crypto from 'crypto';
import { BookingStatus, FreshnessState, InventoryChangeType, CreditLedgerType } from '@prisma/client';
import { prisma } from '../prismaClient';
import { BookingModule } from '../modules/bookingModule';
import { PaymentModule } from '../modules/paymentModule';

describe('Integration Tests: Store Checkout & Real PostgreSQL Concurrency Suite', () => {
  let isDbAvailable = false;
  const TEST_RAZORPAY_KEY = 'rzp_test_integration_key';
  const TEST_RAZORPAY_SECRET = 'test_secret_key_for_hmac_verification_123';

  beforeAll(async () => {
    process.env.RAZORPAY_KEY_ID = TEST_RAZORPAY_KEY;
    process.env.RAZORPAY_KEY_SECRET = TEST_RAZORPAY_SECRET;

    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      isDbAvailable = true;
    } catch {
      isDbAvailable = false;
      console.warn('PostgreSQL database not available. Integration tests in this file will be skipped.');
    }
  });

  afterAll(async () => {
    if (isDbAvailable) {
      await cleanDatabase();
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    if (isDbAvailable) {
      await cleanDatabase();
    }
  });

  async function cleanDatabase() {
    if (!isDbAvailable) return;
    try {
      await prisma.payment.deleteMany();
      await prisma.transactionItem.deleteMany();
      await prisma.transaction.deleteMany();
      await prisma.inventoryLedger.deleteMany();
      await prisma.bookingItem.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.subscriptionCreditLedger.deleteMany();
      await prisma.subscription.deleteMany();
      await prisma.subscriptionPlan.deleteMany();
      await prisma.inventoryBatch.deleteMany();
      await prisma.fish.deleteMany();
      await prisma.category.deleteMany();
      await prisma.customer.deleteMany();
    } catch (err) {
      console.warn('Database cleanup error:', err);
    }
  }

  function generateTestSignature(orderId: string, paymentId: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex');
  }

  it('1. Concurrent Booking Creation against limited stock (Real DB)', async () => {
    if (!isDbAvailable) {
      console.warn('CONCURRENT INTEGRATION TEST 1: SKIPPED (REASON: PostgreSQL unavailable)');
      return;
    }

    const category = await prisma.category.create({
      data: { name: 'Live Pond Fish', slug: 'live-fish-' + Date.now(), active: true },
    });

    const fish = await prisma.fish.create({
      data: {
        categoryId: category.id,
        name: 'Fresh Rohu',
        unitPrice: 200.0,
        onlineBookable: true,
        freshnessState: FreshnessState.GREEN,
      },
    });

    const batch = await prisma.inventoryBatch.create({
      data: {
        fishId: fish.id,
        batchCode: 'BATCH-001',
        receivedQty: 10.0,
        physicalQty: 10.0,
        reservedQty: 0.0,
        availableQty: 10.0,
        expiryAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    const customer1 = await prisma.customer.create({ data: { mobileNumber: '9900000001', name: 'Cust 1' } });
    const customer2 = await prisma.customer.create({ data: { mobileNumber: '9900000002', name: 'Cust 2' } });

    // Concurrent booking requests attempting to reserve the entire 10kg stock simultaneously
    const results = await Promise.allSettled([
      BookingModule.createBooking({
        customerId: customer1.id,
        items: [{ fishId: fish.id, quantityKg: 10.0 }],
      }),
      BookingModule.createBooking({
        customerId: customer2.id,
        items: [{ fishId: fish.id, quantityKg: 10.0 }],
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Database state audit
    const updatedBatch = await prisma.inventoryBatch.findUnique({ where: { id: batch.id } });
    expect(updatedBatch?.availableQty).toBe(0.0);
    expect(updatedBatch?.reservedQty).toBe(10.0);
    expect(updatedBatch?.physicalQty).toBe(10.0);

    const bookings = await prisma.booking.findMany();
    expect(bookings.length).toBe(1);
    expect(bookings[0].status).toBe(BookingStatus.PENDING);

    const ledgerEntries = await prisma.inventoryLedger.findMany({ where: { fishId: fish.id } });
    expect(ledgerEntries.length).toBe(1);
    expect(ledgerEntries[0].changeType).toBe(InventoryChangeType.BOOKING_RESERVATION);
    expect(ledgerEntries[0].quantityChange).toBe(-10.0);
  });

  it('2. Concurrent Worker Completion on same CONFIRMED booking (Real DB)', async () => {
    if (!isDbAvailable) {
      console.warn('CONCURRENT INTEGRATION TEST 2: SKIPPED (REASON: PostgreSQL unavailable)');
      return;
    }

    const category = await prisma.category.create({
      data: { name: 'Fresh Cut', slug: 'fresh-cut-' + Date.now(), active: true },
    });

    const fish = await prisma.fish.create({
      data: {
        categoryId: category.id,
        name: 'Catla Cut',
        unitPrice: 250.0,
        onlineBookable: true,
        freshnessState: FreshnessState.GREEN,
      },
    });

    const batch = await prisma.inventoryBatch.create({
      data: {
        fishId: fish.id,
        batchCode: 'BATCH-002',
        receivedQty: 20.0,
        physicalQty: 20.0,
        reservedQty: 5.0,
        availableQty: 15.0,
        expiryAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    const customer = await prisma.customer.create({ data: { mobileNumber: '9900000003', name: 'Cust 3' } });
    const bookingCode = 'BK-CONF-001';

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        bookingCode,
        qrCodeData: `PONDFISH_BOOKING:${bookingCode}`,
        totalAmount: 1250.0,
        subCreditUsed: 0,
        razorpayPaid: 1250.0,
        status: BookingStatus.CONFIRMED,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
        bookingItems: {
          create: [{ fishId: fish.id, quantityKg: 5.0, unitPrice: 250.0, subtotal: 1250.0 }],
        },
      },
    });

    await prisma.inventoryLedger.create({
      data: {
        fishId: fish.id,
        batchId: batch.id,
        changeType: InventoryChangeType.BOOKING_RESERVATION,
        quantityChange: -5.0,
        resultingQty: 15.0,
        referenceId: bookingCode,
      },
    });

    // Concurrent worker completion requests targeting the same booking
    const results = await Promise.allSettled([
      BookingModule.markBookingComplete(booking.id, 'worker_1'),
      BookingModule.markBookingComplete(booking.id, 'worker_2'),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Verify database state: only 1 completion transition, only 1 physical deduction
    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updatedBooking?.status).toBe(BookingStatus.COMPLETED);

    const updatedBatch = await prisma.inventoryBatch.findUnique({ where: { id: batch.id } });
    expect(updatedBatch?.physicalQty).toBe(15.0); // 20 - 5 = 15
    expect(updatedBatch?.reservedQty).toBe(0.0); // 5 - 5 = 0
    expect(updatedBatch?.availableQty).toBe(15.0);

    const saleLedgers = await prisma.inventoryLedger.findMany({
      where: { changeType: InventoryChangeType.SALE, referenceId: bookingCode },
    });
    expect(saleLedgers.length).toBe(1);
    expect(saleLedgers[0].quantityChange).toBe(-5.0);
  });

  it('3. Completion vs Expiration Race on same booking (Real DB)', async () => {
    if (!isDbAvailable) {
      console.warn('CONCURRENT INTEGRATION TEST 3: SKIPPED (REASON: PostgreSQL unavailable)');
      return;
    }

    const category = await prisma.category.create({
      data: { name: 'Prawns', slug: 'prawns-' + Date.now(), active: true },
    });

    const fish = await prisma.fish.create({
      data: {
        categoryId: category.id,
        name: 'Tiger Prawns',
        unitPrice: 500.0,
        onlineBookable: true,
        freshnessState: FreshnessState.GREEN,
      },
    });

    const batch = await prisma.inventoryBatch.create({
      data: {
        fishId: fish.id,
        batchCode: 'BATCH-003',
        receivedQty: 10.0,
        physicalQty: 10.0,
        reservedQty: 4.0,
        availableQty: 6.0,
        expiryAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    const customer = await prisma.customer.create({ data: { mobileNumber: '9900000004', name: 'Cust 4' } });
    const bookingCode = 'BK-RACE-001';

    // Booking created with an expired timestamp (e.g. past 48h)
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        bookingCode,
        qrCodeData: `PONDFISH_BOOKING:${bookingCode}`,
        totalAmount: 2000.0,
        subCreditUsed: 0,
        razorpayPaid: 2000.0,
        status: BookingStatus.CONFIRMED,
        expiresAt: new Date(Date.now() - 1000), // Expired
        bookingItems: {
          create: [{ fishId: fish.id, quantityKg: 4.0, unitPrice: 500.0, subtotal: 2000.0 }],
        },
      },
    });

    await prisma.inventoryLedger.create({
      data: {
        fishId: fish.id,
        batchId: batch.id,
        changeType: InventoryChangeType.BOOKING_RESERVATION,
        quantityChange: -4.0,
        resultingQty: 6.0,
        referenceId: bookingCode,
      },
    });

    // Launch worker completion and expiration processing concurrently
    await Promise.allSettled([
      BookingModule.markBookingComplete(booking.id, 'worker_race'),
      BookingModule.processExpiredBookings(),
    ]);

    // Database state audit: exactly one terminal state won
    const finalBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect([BookingStatus.COMPLETED, BookingStatus.EXPIRED]).toContain(finalBooking?.status);

    const finalBatch = await prisma.inventoryBatch.findUnique({ where: { id: batch.id } });
    expect(finalBatch?.reservedQty).toBe(0.0);

    if (finalBooking?.status === BookingStatus.COMPLETED) {
      expect(finalBatch?.physicalQty).toBe(6.0); // 10 - 4
      expect(finalBatch?.availableQty).toBe(6.0);
    } else {
      expect(finalBatch?.physicalQty).toBe(10.0);
      expect(finalBatch?.availableQty).toBe(10.0); // 6 + 4 restored
    }
  });

  it('4. Payment Verification vs Expiration Race on PENDING booking (Real DB)', async () => {
    if (!isDbAvailable) {
      console.warn('CONCURRENT INTEGRATION TEST 4: SKIPPED (REASON: PostgreSQL unavailable)');
      return;
    }

    const category = await prisma.category.create({
      data: { name: 'Crabs', slug: 'crabs-' + Date.now(), active: true },
    });

    const fish = await prisma.fish.create({
      data: {
        categoryId: category.id,
        name: 'Mud Crab',
        unitPrice: 600.0,
        onlineBookable: true,
        freshnessState: FreshnessState.GREEN,
      },
    });

    const batch = await prisma.inventoryBatch.create({
      data: {
        fishId: fish.id,
        batchCode: 'BATCH-004',
        receivedQty: 5.0,
        physicalQty: 5.0,
        reservedQty: 2.0,
        availableQty: 3.0,
        expiryAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    const customer = await prisma.customer.create({ data: { mobileNumber: '9900000005', name: 'Cust 5' } });
    const bookingCode = 'BK-PAY-RACE';

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        bookingCode,
        qrCodeData: `PONDFISH_BOOKING:${bookingCode}`,
        totalAmount: 1200.0,
        subCreditUsed: 0,
        razorpayPaid: 1200.0,
        status: BookingStatus.PENDING,
        expiresAt: new Date(Date.now() - 1000), // Expired
        bookingItems: {
          create: [{ fishId: fish.id, quantityKg: 2.0, unitPrice: 600.0, subtotal: 1200.0 }],
        },
      },
    });

    await prisma.inventoryLedger.create({
      data: {
        fishId: fish.id,
        batchId: batch.id,
        changeType: InventoryChangeType.BOOKING_RESERVATION,
        quantityChange: -2.0,
        resultingQty: 3.0,
        referenceId: bookingCode,
      },
    });

    const orderId = 'order_race_001';
    const paymentId = 'pay_race_001';
    const signature = generateTestSignature(orderId, paymentId, TEST_RAZORPAY_SECRET);

    // Launch payment verification and expiration process concurrently
    await Promise.allSettled([
      PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        amount: 1200.0,
        bookingId: booking.id,
      }),
      BookingModule.processExpiredBookings(),
    ]);

    const finalBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    const payments = await prisma.payment.findMany({ where: { bookingId: booking.id } });

    if (finalBooking?.status === BookingStatus.CONFIRMED) {
      expect(payments.length).toBe(1);
      expect(payments[0].status).toBe('SUCCESS');
    } else {
      expect(finalBooking?.status).toBe(BookingStatus.EXPIRED);
      expect(payments.length).toBe(0); // Zero payment row persisted if expiration won
    }
  });

  it('5. Duplicate Payment Verification (Idempotency against Real DB)', async () => {
    if (!isDbAvailable) {
      console.warn('CONCURRENT INTEGRATION TEST 5: SKIPPED (REASON: PostgreSQL unavailable)');
      return;
    }

    const category = await prisma.category.create({
      data: { name: 'Sea Fish', slug: 'sea-fish-' + Date.now(), active: true },
    });

    const fish = await prisma.fish.create({
      data: {
        categoryId: category.id,
        name: 'Pomfret',
        unitPrice: 800.0,
        onlineBookable: true,
        freshnessState: FreshnessState.GREEN,
      },
    });

    const customer = await prisma.customer.create({ data: { mobileNumber: '9900000006', name: 'Cust 6' } });
    const bookingCode = 'BK-IDEMPOTENT';

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        bookingCode,
        qrCodeData: `PONDFISH_BOOKING:${bookingCode}`,
        totalAmount: 1600.0,
        subCreditUsed: 0,
        razorpayPaid: 1600.0,
        status: BookingStatus.PENDING,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
        bookingItems: {
          create: [{ fishId: fish.id, quantityKg: 2.0, unitPrice: 800.0, subtotal: 1600.0 }],
        },
      },
    });

    const orderId = 'order_idem_001';
    const paymentId = 'pay_idem_001';
    const signature = generateTestSignature(orderId, paymentId, TEST_RAZORPAY_SECRET);

    const paymentPayload = {
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      amount: 1600.0,
      bookingId: booking.id,
    };

    // Sequential or concurrent duplicate payment verification
    const res1 = await PaymentModule.verifyRazorpayPayment(paymentPayload);
    const res2 = await PaymentModule.verifyRazorpayPayment(paymentPayload);

    expect(res1.id).toBe(res2.id);

    const payments = await prisma.payment.findMany({ where: { razorpayPaymentId: paymentId } });
    expect(payments.length).toBe(1);

    const finalBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(finalBooking?.status).toBe(BookingStatus.CONFIRMED);
  });

  it('6. Razorpay Order-to-Booking Binding Mismatch Security Test (Real DB)', async () => {
    if (!isDbAvailable) {
      console.warn('CONCURRENT INTEGRATION TEST 6: SKIPPED (REASON: PostgreSQL unavailable)');
      return;
    }

    const category = await prisma.category.create({
      data: { name: 'Fresh Fish', slug: 'fresh-fish-' + Date.now(), active: true },
    });

    const fish = await prisma.fish.create({
      data: {
        categoryId: category.id,
        name: 'Rohu Special',
        unitPrice: 300.0,
        onlineBookable: true,
        freshnessState: FreshnessState.GREEN,
      },
    });

    const customer = await prisma.customer.create({ data: { mobileNumber: '9900000007', name: 'Cust 7' } });

    // Create Booking A
    const bookingA = await prisma.booking.create({
      data: {
        customerId: customer.id,
        bookingCode: 'BK-BOUND-A',
        qrCodeData: 'PONDFISH_BOOKING:BK-BOUND-A',
        totalAmount: 600.0,
        subCreditUsed: 0,
        razorpayPaid: 600.0,
        status: BookingStatus.PENDING,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    // Create Booking B
    const bookingB = await prisma.booking.create({
      data: {
        customerId: customer.id,
        bookingCode: 'BK-BOUND-B',
        qrCodeData: 'PONDFISH_BOOKING:BK-BOUND-B',
        totalAmount: 600.0,
        subCreditUsed: 0,
        razorpayPaid: 600.0,
        status: BookingStatus.PENDING,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    });

    // Create Razorpay Order server-side for Booking A
    const orderA = await PaymentModule.createRazorpayOrder({
      bookingId: bookingA.id,
      customerId: customer.id,
    });

    const paymentId = 'pay_attack_swap_001';
    const signature = generateTestSignature(orderA.razorpayOrderId, paymentId, TEST_RAZORPAY_SECRET);

    // Attempt to verify payment using Order A's credentials against Booking B
    await expect(
      PaymentModule.verifyRazorpayPayment({
        razorpayOrderId: orderA.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        amount: 600.0,
        bookingId: bookingB.id, // Swapped booking ID!
        customerId: customer.id,
      })
    ).rejects.toThrow('Submitted Razorpay order ID does not match the target booking.');

    // Assert Booking B remains PENDING
    const recheckedBookingB = await prisma.booking.findUnique({ where: { id: bookingB.id } });
    expect(recheckedBookingB?.status).toBe(BookingStatus.PENDING);

    // Assert 0 payment rows created for Booking B
    const paymentsForB = await prisma.payment.findMany({ where: { bookingId: bookingB.id } });
    expect(paymentsForB.length).toBe(0);
  });
});


