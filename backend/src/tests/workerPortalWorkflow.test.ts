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
        update: jest.fn(),
      },
      inventoryBatch: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      inventoryLedger: {
        findFirst: jest.fn(),
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

  describe('3. Booking State Transition & Inventory Completion Hardening', () => {
    it('1. CONFIRMED booking can be completed successfully', async () => {
      const mockBooking = {
        id: 'bk-confirmed-1',
        bookingCode: 'BK-888888',
        status: BookingStatus.CONFIRMED,
        bookingItems: [
          { id: 'item-1', fishId: 'fish-rohu', quantityKg: 2.0, unitPrice: 200 },
        ],
      };

      const mockBatch = {
        id: 'batch-reserved-1',
        fishId: 'fish-rohu',
        physicalQty: 10.0,
        reservedQty: 2.0,
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockBooking),
            update: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.COMPLETED }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue({ batchId: 'batch-reserved-1' }),
            create: jest.fn().mockResolvedValue({ id: 'ledger-sale-1' }),
          },
          inventoryBatch: {
            findUnique: jest.fn().mockResolvedValue(mockBatch),
            findFirst: jest.fn().mockResolvedValue(mockBatch),
            update: jest.fn().mockResolvedValue({ ...mockBatch, physicalQty: 8.0, reservedQty: 0.0 }),
          },
        };
        return cb(tx);
      });

      const result = await BookingModule.markBookingComplete('bk-confirmed-1', 'worker-id-1');

      expect(result.status).toBe(BookingStatus.COMPLETED);
    });

    it('2. PENDING booking is rejected with ERR_BOOKING_NOT_CONFIRMED', async () => {
      const mockPendingBooking = {
        id: 'bk-pending-1',
        bookingCode: 'BK-PENDING',
        status: BookingStatus.PENDING,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 1.0 }],
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockPendingBooking),
          },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-pending-1', 'worker-id-1');
        fail('Should have thrown ERR_BOOKING_NOT_CONFIRMED');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_BOOKING_NOT_CONFIRMED');
        expect(err.statusCode).toBe(400);
      }
    });

    it('3. EXPIRED booking is rejected with ERR_BOOKING_EXPIRED', async () => {
      const mockExpiredBooking = {
        id: 'bk-expired-1',
        bookingCode: 'BK-EXPIRED',
        status: BookingStatus.EXPIRED,
        bookingItems: [],
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockExpiredBooking),
          },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-expired-1', 'worker-id-1');
        fail('Should have thrown ERR_BOOKING_EXPIRED');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_BOOKING_EXPIRED');
        expect(err.statusCode).toBe(400);
      }
    });

    it('4. COMPLETED booking is rejected with ERR_BOOKING_ALREADY_COMPLETED', async () => {
      const mockCompletedBooking = {
        id: 'bk-completed-1',
        bookingCode: 'BK-DONE',
        status: BookingStatus.COMPLETED,
        bookingItems: [],
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockCompletedBooking),
          },
        };
        return cb(tx);
      });

      try {
        await BookingModule.markBookingComplete('bk-completed-1', 'worker-id-1');
        fail('Should have thrown ERR_BOOKING_ALREADY_COMPLETED');
      } catch (err: any) {
        expect(err).toBeInstanceOf(DomainError);
        expect(err.code).toBe('ERR_BOOKING_ALREADY_COMPLETED');
        expect(err.statusCode).toBe(400);
      }
    });

    it('5. Invalid booking state causes zero physical inventory deduction', async () => {
      const mockPendingBooking = {
        id: 'bk-pending-2',
        bookingCode: 'BK-PENDING-2',
        status: BookingStatus.PENDING,
        bookingItems: [{ id: 'item-1', fishId: 'fish-rohu', quantityKg: 5.0 }],
      };

      const mockBatchUpdate = jest.fn();
      const mockLedgerCreate = jest.fn();

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockPendingBooking),
            update: jest.fn(),
          },
          inventoryBatch: {
            update: mockBatchUpdate,
          },
          inventoryLedger: {
            create: mockLedgerCreate,
          },
        };
        return cb(tx);
      });

      await expect(
        BookingModule.markBookingComplete('bk-pending-2', 'worker-id-1')
      ).rejects.toThrow(DomainError);

      expect(mockBatchUpdate).not.toHaveBeenCalled();
      expect(mockLedgerCreate).not.toHaveBeenCalled();
    });

    it('6. Correct reserved inventory batch is used during completion when multiple batches exist', async () => {
      const mockBooking = {
        id: 'bk-reserved-batch-test',
        bookingCode: 'BK-RESERVED-999',
        status: BookingStatus.CONFIRMED,
        bookingItems: [
          { id: 'item-1', fishId: 'fish-catla', quantityKg: 3.0, unitPrice: 250 },
        ],
      };

      const mockSpecificBatch = {
        id: 'batch-specific-reserved-id',
        fishId: 'fish-catla',
        physicalQty: 15.0,
        reservedQty: 3.0,
      };

      const mockBatchUpdate = jest.fn().mockResolvedValue({ ...mockSpecificBatch, physicalQty: 12.0, reservedQty: 0.0 });
      const mockLedgerCreate = jest.fn().mockResolvedValue({ id: 'ledger-sale-specific' });

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockBooking),
            update: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.COMPLETED }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockImplementation((args: any) => {
              if (args.where.referenceId === 'BK-RESERVED-999' && args.where.changeType === InventoryChangeType.BOOKING_RESERVATION) {
                return Promise.resolve({ batchId: 'batch-specific-reserved-id' });
              }
              return Promise.resolve(null);
            }),
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            findUnique: jest.fn().mockImplementation((args: any) => {
              if (args.where.id === 'batch-specific-reserved-id') {
                return Promise.resolve(mockSpecificBatch);
              }
              return Promise.resolve(null);
            }),
            findFirst: jest.fn(),
            update: mockBatchUpdate,
          },
        };
        return cb(tx);
      });

      await BookingModule.markBookingComplete('bk-reserved-batch-test', 'worker-1');

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        where: { id: 'batch-specific-reserved-id' },
        data: {
          physicalQty: { decrement: 3.0 },
          reservedQty: { decrement: 3.0 },
        },
      });
    });

    it('7. Inventory ledger reflects the correct SALE quantity and resulting quantity', async () => {
      const mockBooking = {
        id: 'bk-ledger-test',
        bookingCode: 'BK-LEDGER-111',
        status: BookingStatus.CONFIRMED,
        bookingItems: [
          { id: 'item-1', fishId: 'fish-prawns', quantityKg: 4.0, unitPrice: 500 },
        ],
      };

      const mockBatch = {
        id: 'batch-prawns-1',
        fishId: 'fish-prawns',
        physicalQty: 20.0,
        reservedQty: 4.0,
      };

      const mockLedgerCreate = jest.fn().mockResolvedValue({ id: 'ledger-created' });

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockResolvedValue(mockBooking),
            update: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.COMPLETED }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockResolvedValue({ batchId: 'batch-prawns-1' }),
            create: mockLedgerCreate,
          },
          inventoryBatch: {
            findUnique: jest.fn().mockResolvedValue(mockBatch),
            findFirst: jest.fn().mockResolvedValue(mockBatch),
            update: jest.fn().mockResolvedValue({ ...mockBatch, physicalQty: 16.0 }),
          },
        };
        return cb(tx);
      });

      await BookingModule.markBookingComplete('bk-ledger-test', 'worker-1');

      expect(mockLedgerCreate).toHaveBeenCalledWith({
        data: {
          fishId: 'fish-prawns',
          batchId: 'batch-prawns-1',
          changeType: InventoryChangeType.SALE,
          quantityChange: -4.0,
          resultingQty: 16.0,
          referenceId: 'BK-LEDGER-111',
        },
      });
    });

    it('8. Booking becomes COMPLETED only after valid confirmation and inventory processing succeed', async () => {
      const mockBooking = {
        id: 'bk-order-test',
        bookingCode: 'BK-ORDER-555',
        status: BookingStatus.CONFIRMED,
        bookingItems: [
          { id: 'item-1', fishId: 'fish-rohu', quantityKg: 1.0, unitPrice: 200 },
        ],
      };

      const mockBatch = {
        id: 'batch-rohu-1',
        fishId: 'fish-rohu',
        physicalQty: 10.0,
        reservedQty: 1.0,
      };

      const executionOrder: string[] = [];

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          booking: {
            findUnique: jest.fn().mockImplementation(async () => {
              executionOrder.push('findUnique_booking');
              return mockBooking;
            }),
            update: jest.fn().mockImplementation(async () => {
              executionOrder.push('update_booking_status');
              return { ...mockBooking, status: BookingStatus.COMPLETED };
            }),
          },
          inventoryLedger: {
            findFirst: jest.fn().mockImplementation(async () => {
              executionOrder.push('find_reservation_ledger');
              return { batchId: 'batch-rohu-1' };
            }),
            create: jest.fn().mockImplementation(async () => {
              executionOrder.push('create_sale_ledger');
              return { id: 'ledger-sale' };
            }),
          },
          inventoryBatch: {
            findUnique: jest.fn().mockImplementation(async () => {
              executionOrder.push('find_batch');
              return mockBatch;
            }),
            update: jest.fn().mockImplementation(async () => {
              executionOrder.push('update_batch_qty');
              return { ...mockBatch, physicalQty: 9.0 };
            }),
          },
        };
        return cb(tx);
      });

      const result = await BookingModule.markBookingComplete('bk-order-test', 'worker-1');

      expect(result.status).toBe(BookingStatus.COMPLETED);
      expect(executionOrder).toEqual([
        'findUnique_booking',
        'find_reservation_ledger',
        'find_batch',
        'update_batch_qty',
        'create_sale_ledger',
        'update_booking_status',
      ]);
    });
  });
});
