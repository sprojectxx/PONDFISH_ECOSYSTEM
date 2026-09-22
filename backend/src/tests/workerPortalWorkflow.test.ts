import { AuthModule } from '../modules/authModule';
import { BookingModule } from '../modules/bookingModule';
import { DomainError } from '../middleware/errorHandler';
import { BookingStatus } from '@prisma/client';
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

  describe('3. Booking Pickup Completion Rules', () => {
    it('successfully completes an active booking and deducts physical inventory', async () => {
      const mockBooking = {
        id: 'bk-active-1',
        bookingCode: 'BK-888888',
        status: BookingStatus.CONFIRMED,
        bookingItems: [
          { id: 'item-1', fishId: 'fish-rohu', quantityKg: 2.0, unitPrice: 200 },
        ],
      };

      const mockBatch = {
        id: 'batch-1',
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
          inventoryBatch: {
            findFirst: jest.fn().mockResolvedValue(mockBatch),
            update: jest.fn().mockResolvedValue({ ...mockBatch, physicalQty: 8.0, reservedQty: 0.0 }),
          },
          inventoryLedger: {
            create: jest.fn().mockResolvedValue({ id: 'ledger-1' }),
          },
        };
        return cb(tx);
      });

      const result = await BookingModule.markBookingComplete('bk-active-1', 'worker-id-1');

      expect(result.status).toBe(BookingStatus.COMPLETED);
    });

    it('rejects completion when booking is EXPIRED (48h window passed)', async () => {
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

      await expect(
        BookingModule.markBookingComplete('bk-expired-1', 'worker-id-1')
      ).rejects.toThrow('Cannot complete booking. Booking has expired (48h window passed).');
    });

    it('rejects completion when booking is ALREADY COMPLETED', async () => {
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

      await expect(
        BookingModule.markBookingComplete('bk-completed-1', 'worker-id-1')
      ).rejects.toThrow('Booking is already marked complete.');
    });
  });
});
