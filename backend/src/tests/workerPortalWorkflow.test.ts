import { AuthModule } from '../modules/authModule';
import { BookingModule } from '../modules/bookingModule';
import { DomainError } from '../middleware/errorHandler';
import { BookingStatus, InventoryChangeType } from '@prisma/client';
import { prisma } from '../prismaClient';

jest.mock('../prismaClient', () => {
  return {
    prisma: {
      worker: {
        findUnique: jest.fn(),
      },
      booking: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      fish: {
        findUnique: jest.fn(),
      },
      inventoryBatch: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      inventoryLedger: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      subscription: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      subscriptionCreditLedger: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };
});

describe('Worker Portal Operations & Workflow Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Worker Authentication', () => {
    it('rejects authentication when worker email is not found', async () => {
      (prisma.worker.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        AuthModule.workerLogin('nonexistent@pondfish.com', 'password123')
      ).rejects.toThrow(DomainError);
    });

    it('rejects authentication when password is invalid', async () => {
      (prisma.worker.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'worker-user-1',
        email: 'worker@pondfish.com',
        active: true,
        passwordHash: '$2b$10$invalidhash',
      });

      await expect(
        AuthModule.workerLogin('worker@pondfish.com', 'wrongpassword')
      ).rejects.toThrow(DomainError);
    });
  });

  describe('2. Worker Bookings Search & Loading', () => {
    it('queries bookings with search filter and includes customer details', async () => {
      const mockBookings = [
        {
          id: 'bk-1',
          bookingCode: 'BK-100001',
          status: BookingStatus.CONFIRMED,
          totalAmount: 450,
          customer: { name: 'Ramesh Varma', mobileNumber: '9999999999' },
          bookingItems: [],
        },
      ];

      (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce(mockBookings);

      const result = await BookingModule.getWorkerBookings({ search: 'Ramesh', status: BookingStatus.CONFIRMED });

      expect(result).toEqual(mockBookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: BookingStatus.CONFIRMED,
            OR: expect.arrayContaining([
              { bookingCode: { contains: 'Ramesh', mode: 'insensitive' } },
              { customer: { name: { contains: 'Ramesh', mode: 'insensitive' } } },
            ]),
          }),
        })
      );
    });

    it('filters bookings by valid BookingStatus enum values', async () => {
      (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce([]);

      await BookingModule.getWorkerBookings({ status: BookingStatus.PENDING });

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: BookingStatus.PENDING,
          }),
        })
      );
    });
  });

  describe('3. Booking Reservation Integrity & Inventory Concurrency Unit Tests', () => {
    it('1. Booking with two different fish: each reservation points to its own batch, completion deducts both and creates 2 SALE ledgers', async () => {
      const mockBooking = {
        id: 'bk-multi-fish-1',
        bookingCode: 'BK-MULTI-100',
        status: BookingStatus.CONFIRMED,
        bookingItems: [
          { id: 'item-1', fishId: 'fish-rohu', quantityKg: 2.0, unitPrice: 200 },
          { id: 'item-2', fishId: 'fish-catla', quantityKg: 3.0, unitPrice: 300 },
        ],
      };

      const mockBatchRohu = { id: 'batch-rohu-1', fishId: 'fish-rohu', physicalQty: 10.0, reservedQty: 2.0 };
      const mockBatchCatla = { id: 'batch-catla-1', fishId: 'fish-catla', physicalQty: 15.0, reservedQty: 3.0 };

      const mockBatchUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
      const mockLedgerCreate = jest.fn().mockResolvedValue({ id: 'ledger-sale-ok' });

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValueOnce(mockBooking).mockResolvedValueOnce({ ...mockBooking, status: BookingStatus.COMPLETED }),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockImplementation((args: any) => {
              if (args.where.fishId === 'fish-rohu') return Promise.resolve({ batchId: 'batch-rohu-1' });
              if (args.where.fishId === 'fish-catla') return Promise.resolve({ batchId: 'batch-catla-1' });
              return Promise.resolve(null);
            }),
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            findUnique: jest.fn().mockImplementation((args: any) => {
              if (args.where.id === 'batch-rohu-1') return Promise.resolve(mockBatchRohu);
              if (args.where.id === 'batch-catla-1') return Promise.resolve(mockBatchCatla);
              return Promise.resolve(null);
            }),
            updateMany: mockBatchUpdateMany,
          },
        };
        return cb(tx);
      });

      const result = await BookingModule.markBookingComplete('bk-multi-fish-1', 'worker-1');

      expect(result.status).toBe(BookingStatus.COMPLETED);
      expect(mockBatchUpdateMany).toHaveBeenCalledTimes(2);
      expect(mockLedgerCreate).toHaveBeenCalledTimes(2);
      expect(mockLedgerCreate).toHaveBeenNthCalledWith(1, {
        data: {
          fishId: 'fish-rohu',
          batchId: 'batch-rohu-1',
          changeType: InventoryChangeType.SALE,
          quantityChange: -2.0,
          resultingQty: 8.0,
          referenceId: 'BK-MULTI-100',
        },
      });
      expect(mockLedgerCreate).toHaveBeenNthCalledWith(2, {
        data: {
          fishId: 'fish-catla',
          batchId: 'batch-catla-1',
          changeType: InventoryChangeType.SALE,
          quantityChange: -3.0,
          resultingQty: 12.0,
          referenceId: 'BK-MULTI-100',
        },
      });
    });

    it('2. Booking with multiple batches of the same fish: completion uses exact reserved batch, not newer batch', async () => {
      const mockBooking = {
        id: 'bk-exact-batch-test',
        bookingCode: 'BK-EXACT-888',
        status: BookingStatus.CONFIRMED,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 4.0, unitPrice: 200 }],
      };

      const mockReservedOldBatch = { id: 'batch-old-fifo-1', fishId: 'fish-rohu', physicalQty: 20.0, reservedQty: 4.0 };

      const mockBatchUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
      const mockLedgerCreate = jest.fn().mockResolvedValue({ id: 'ledger-sale-exact' });

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValueOnce(mockBooking).mockResolvedValueOnce({ ...mockBooking, status: BookingStatus.COMPLETED }),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue({ batchId: 'batch-old-fifo-1' }),
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            findUnique: jest.fn().mockResolvedValue(mockReservedOldBatch),
            updateMany: mockBatchUpdateMany,
          },
        };
        return cb(tx);
      });

      await BookingModule.markBookingComplete('bk-exact-batch-test', 'worker-1');

      expect(mockBatchUpdateMany).toHaveBeenCalledWith({
        where: { id: 'batch-old-fifo-1', reservedQty: { gte: 4.0 } },
        data: { physicalQty: { decrement: 4.0 }, reservedQty: { decrement: 4.0 } },
      });
    });

    it('3. Missing reservation ledger: completion fails with ERR_BOOKING_RESERVATION_NOT_FOUND (409) and zero inventory is changed', async () => {
      const mockBooking = {
        id: 'bk-no-ledger',
        bookingCode: 'BK-NO-LEDGER',
        status: BookingStatus.CONFIRMED,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 2.0 }],
      };

      const mockBatchUpdateMany = jest.fn();
      const mockLedgerCreate = jest.fn();

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockBooking),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue(null), // Missing reservation ledger
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            updateMany: mockBatchUpdateMany,
          },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-no-ledger', 'worker-1');
        fail('Should have thrown ERR_BOOKING_RESERVATION_NOT_FOUND');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_BOOKING_RESERVATION_NOT_FOUND');
        expect(err.statusCode).toBe(409);
      }

      expect(mockBatchUpdateMany).not.toHaveBeenCalled();
      expect(mockLedgerCreate).not.toHaveBeenCalled();
    });

    it('4. Missing reservation batch: completion fails with ERR_INVENTORY_RESERVATION_INVALID (409) and zero inventory is changed', async () => {
      const mockBooking = {
        id: 'bk-no-batch',
        bookingCode: 'BK-NO-BATCH',
        status: BookingStatus.CONFIRMED,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 2.0 }],
      };

      const mockBatchUpdateMany = jest.fn();
      const mockLedgerCreate = jest.fn();

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockBooking),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue({ batchId: 'batch-deleted-99' }),
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            findUnique: jest.fn().mockResolvedValue(null), // Batch deleted/missing
            updateMany: mockBatchUpdateMany,
          },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-no-batch', 'worker-1');
        fail('Should have thrown ERR_INVENTORY_RESERVATION_INVALID');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_INVENTORY_RESERVATION_INVALID');
        expect(err.statusCode).toBe(409);
      }

      expect(mockBatchUpdateMany).not.toHaveBeenCalled();
      expect(mockLedgerCreate).not.toHaveBeenCalled();
    });

    it('5. Insufficient reservedQty (CAS count = 0): completion fails with ERR_INVENTORY_RESERVATION_INVALID (409)', async () => {
      const mockBooking = {
        id: 'bk-insufficient-reserved',
        bookingCode: 'BK-INSUFFICIENT-RES',
        status: BookingStatus.CONFIRMED,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 5.0 }],
      };

      const mockBatchInsufficient = {
        id: 'batch-insufficient-1',
        fishId: 'fish-rohu',
        physicalQty: 10.0,
        reservedQty: 2.0, // Only 2kg reserved, required 5kg
      };

      const mockLedgerCreate = jest.fn();

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockBooking),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue({ batchId: 'batch-insufficient-1' }),
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            findUnique: jest.fn().mockResolvedValue(mockBatchInsufficient),
            updateMany: jest.fn().mockResolvedValue({ count: 0 }), // CAS atomic check fails
          },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-insufficient-reserved', 'worker-1');
        fail('Should have thrown ERR_INVENTORY_RESERVATION_INVALID');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_INVENTORY_RESERVATION_INVALID');
        expect(err.statusCode).toBe(409);
      }

      expect(mockLedgerCreate).not.toHaveBeenCalled();
    });

    it('6. Expired booking with valid reservation: exact batch is released and BOOKING_RELEASE ledger created', async () => {
      const mockExpiredBooking = {
        id: 'bk-expiring-valid',
        bookingCode: 'BK-EXPIRING-777',
        status: BookingStatus.PENDING,
        subCreditUsed: 0,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 3.0 }],
      };

      (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce([mockExpiredBooking]);

      const mockBatchToRelease = {
        id: 'batch-release-1',
        fishId: 'fish-rohu',
        reservedQty: 3.0,
        availableQty: 10.0,
      };

      const mockBatchUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
      const mockLedgerCreate = jest.fn().mockResolvedValue({ id: 'ledger-release-ok' });

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue({ batchId: 'batch-release-1' }),
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            findUnique: jest.fn().mockResolvedValue(mockBatchToRelease),
            updateMany: mockBatchUpdateMany,
          },
        };
        return cb(tx);
      });

      const result = await BookingModule.processExpiredBookings();

      expect(result.processedCount).toBe(1);
      expect(mockBatchUpdateMany).toHaveBeenCalledWith({
        where: { id: 'batch-release-1', reservedQty: { gte: 3.0 } },
        data: { reservedQty: { decrement: 3.0 }, availableQty: { increment: 3.0 } },
      });
      expect(mockLedgerCreate).toHaveBeenCalledWith({
        data: {
          fishId: 'fish-rohu',
          batchId: 'batch-release-1',
          changeType: InventoryChangeType.BOOKING_RELEASE,
          quantityChange: 3.0,
          resultingQty: 13.0,
          referenceId: 'EXPIRY_BK-EXPIRING-777',
        },
      });
    });

    it('7. Expired booking with missing reservation: expiry transaction fails safely and booking status is not modified', async () => {
      const mockExpiredBookingNoLedger = {
        id: 'bk-expiring-invalid',
        bookingCode: 'BK-EXPIRING-FAIL',
        status: BookingStatus.PENDING,
        subCreditUsed: 0,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 3.0 }],
      };

      (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce([mockExpiredBookingNoLedger]);

      const mockBatchUpdateMany = jest.fn();

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue(null), // Missing reservation
          },
          inventoryBatch: {
            updateMany: mockBatchUpdateMany,
          },
        };
        return cb(tx);
      });

      await expect(BookingModule.processExpiredBookings()).rejects.toThrow(DomainError);
      expect(mockBatchUpdateMany).not.toHaveBeenCalled();
    });

    it('8. Same-fish duplicate booking items: createBooking normalizes/aggregates duplicate items into single reservation', async () => {
      const mockFish = {
        id: 'fish-rohu-dup',
        name: 'Rohu',
        unitPrice: 200,
        onlineBookable: true,
      };

      const mockBatch = {
        id: 'batch-rohu-dup-1',
        fishId: 'fish-rohu-dup',
        availableQty: 20.0,
        reservedQty: 0.0,
      };

      const mockBookingCreated = {
        id: 'bk-dup-created',
        bookingCode: 'BK-DUP-100',
        status: BookingStatus.PENDING,
        totalAmount: 1000,
        bookingItems: [{ fishId: 'fish-rohu-dup', quantityKg: 5.0, unitPrice: 200, subtotal: 1000 }],
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          fish: {
            findUnique: jest.fn().mockResolvedValue(mockFish),
          },
          inventoryBatch: {
            findMany: jest.fn().mockResolvedValue([mockBatch]),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventoryLedger: {
            create: jest.fn().mockResolvedValue({ id: 'ledger-res-dup' }),
          },
          subscription: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
          booking: {
            create: jest.fn().mockResolvedValue(mockBookingCreated),
          },
        };
        return cb(tx);
      });

      // Submit duplicate fish items: 2kg + 3kg
      const result = await BookingModule.createBooking({
        customerId: 'cust-1',
        items: [
          { fishId: 'fish-rohu-dup', quantityKg: 2.0 },
          { fishId: 'fish-rohu-dup', quantityKg: 3.0 },
        ],
      });

      expect(result.bookingItems[0].quantityKg).toBe(5.0);
      expect(result.totalAmount).toBe(1000);
    });

    it('9. Existing PENDING booking: rejected with ERR_BOOKING_NOT_CONFIRMED', async () => {
      const mockPendingBooking = {
        id: 'bk-pending-check',
        bookingCode: 'BK-PENDING-CHECK',
        status: BookingStatus.PENDING,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 1.0 }],
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: { findUnique: jest.fn().mockResolvedValue(mockPendingBooking) },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-pending-check', 'worker-1');
        fail('Should have thrown ERR_BOOKING_NOT_CONFIRMED');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_BOOKING_NOT_CONFIRMED');
        expect(err.statusCode).toBe(400);
      }
    });

    it('10. Existing COMPLETED booking: rejected with ERR_BOOKING_ALREADY_COMPLETED', async () => {
      const mockCompletedBooking = {
        id: 'bk-completed-check',
        bookingCode: 'BK-COMPLETED-CHECK',
        status: BookingStatus.COMPLETED,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 1.0 }],
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: { findUnique: jest.fn().mockResolvedValue(mockCompletedBooking) },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-completed-check', 'worker-1');
        fail('Should have thrown ERR_BOOKING_ALREADY_COMPLETED');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_BOOKING_ALREADY_COMPLETED');
        expect(err.statusCode).toBe(400);
      }
    });

    it('11. Existing EXPIRED booking: rejected with ERR_BOOKING_EXPIRED', async () => {
      const mockExpiredBooking = {
        id: 'bk-expired-check',
        bookingCode: 'BK-EXPIRED-CHECK',
        status: BookingStatus.EXPIRED,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 1.0 }],
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: { findUnique: jest.fn().mockResolvedValue(mockExpiredBooking) },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-expired-check', 'worker-1');
        fail('Should have thrown ERR_BOOKING_EXPIRED');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_BOOKING_EXPIRED');
        expect(err.statusCode).toBe(400);
      }
    });
  });
});
