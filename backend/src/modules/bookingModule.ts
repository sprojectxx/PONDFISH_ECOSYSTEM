import { prisma } from '../prismaClient';
import { BookingStatus, InventoryChangeType, CreditLedgerType, Prisma } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

export class BookingModule {
  static async createBooking(data: {
    customerId: string;
    items: Array<{ fishId: string; quantityKg: number }>;
    useSubscriptionCredit?: boolean;
  }) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Normalize & aggregate duplicate items by fishId to guarantee unique (bookingCode, fishId) reservations
      const itemMap = new Map<string, number>();
      for (const item of data.items || []) {
        if (!item.fishId || item.quantityKg <= 0) continue;
        const currentKg = itemMap.get(item.fishId) || 0;
        itemMap.set(item.fishId, currentKg + item.quantityKg);
      }

      const normalizedItems = Array.from(itemMap.entries()).map(([fishId, quantityKg]) => ({
        fishId,
        quantityKg,
      }));

      if (normalizedItems.length === 0) {
        throw new DomainError('ERR_INVALID_INPUT', 'Booking must contain at least one valid item with positive quantity.', 400);
      }

      let totalAmount = 0.0;
      const bookingItemsToCreate: Array<{ fishId: string; quantityKg: number; unitPrice: number; subtotal: number }> = [];
      const bookingCode = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const qrCodeData = `PONDFISH_BOOKING:${bookingCode}`;
      // Expiry duration strictly set to 48 elapsed hours from creation
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      for (const item of normalizedItems) {
        const fish = await tx.fish.findUnique({ where: { id: item.fishId } });
        if (!fish || !fish.onlineBookable) {
          throw new DomainError('ERR_NOT_ONLINE_BOOKABLE', `Fish item ${fish?.name || item.fishId} is not available for online booking.`, 400);
        }

        // Check inventory batches for available stock (FIFO selection)
        const batches = await tx.inventoryBatch.findMany({
          where: { fishId: item.fishId, availableQty: { gte: item.quantityKg }, expiryAt: { gt: new Date() } },
          orderBy: { receivedAt: 'asc' },
        });

        if (batches.length === 0) {
          throw new DomainError('ERR_INVENTORY_INSUFFICIENT', `Insufficient stock for ${fish.name}. Requested: ${item.quantityKg}kg.`, 409);
        }

        const selectedBatch = batches[0];
        const subtotal = fish.unitPrice * item.quantityKg;
        totalAmount += subtotal;

        bookingItemsToCreate.push({
          fishId: fish.id,
          quantityKg: item.quantityKg,
          unitPrice: fish.unitPrice,
          subtotal,
        });

        // Reserve stock atomically on the selected FIFO batch
        await tx.inventoryBatch.update({
          where: { id: selectedBatch.id },
          data: {
            reservedQty: { increment: item.quantityKg },
            availableQty: { decrement: item.quantityKg },
          },
        });

        // Record reservation ledger linking exact batchId & referenceId: bookingCode
        await tx.inventoryLedger.create({
          data: {
            fishId: fish.id,
            batchId: selectedBatch.id,
            changeType: InventoryChangeType.BOOKING_RESERVATION,
            quantityChange: -item.quantityKg,
            resultingQty: selectedBatch.availableQty - item.quantityKg,
            referenceId: bookingCode,
          },
        });
      }

      // Check subscription credit if requested
      let subCreditUsed = 0.0;
      if (data.useSubscriptionCredit) {
        const sub = await tx.subscription.findFirst({
          where: { customerId: data.customerId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        });

        if (sub && sub.creditBalance > 0) {
          subCreditUsed = Math.min(totalAmount, sub.creditBalance);

          await tx.subscription.update({
            where: { id: sub.id },
            data: {
              creditBalance: { decrement: subCreditUsed },
            },
          });

          await tx.subscriptionCreditLedger.create({
            data: {
              subscriptionId: sub.id,
              type: CreditLedgerType.DEBIT_BOOKING,
              amount: -subCreditUsed,
              resultingBalance: sub.creditBalance - subCreditUsed,
            },
          });
        }
      }

      const booking = await tx.booking.create({
        data: {
          customerId: data.customerId,
          bookingCode,
          qrCodeData,
          totalAmount,
          subCreditUsed,
          razorpayPaid: Math.max(0, totalAmount - subCreditUsed),
          status: subCreditUsed >= totalAmount ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
          expiresAt,
          bookingItems: {
            create: bookingItemsToCreate,
          },
        },
        include: {
          bookingItems: { include: { fish: true } },
        },
      });

      return booking;
    });
  }

  static async getBookingById(bookingId: string, customerId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingCode: bookingId }],
        customerId,
      },
      include: {
        bookingItems: { include: { fish: true } },
      },
    });

    if (!booking) {
      throw new DomainError('ERR_BOOKING_NOT_FOUND', 'Booking record not found.', 404);
    }

    return booking;
  }

  static async getCustomerBookings(customerId: string) {
    return await prisma.booking.findMany({
      where: { customerId },
      include: {
        bookingItems: { include: { fish: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getWorkerBookings(params?: { search?: string; status?: BookingStatus }) {
    const { search, status } = params || {};
    const whereClause: Prisma.BookingWhereInput = {};

    if (status) {
      whereClause.status = status;
    }

    if (search && search.trim().length > 0) {
      const query = search.trim();
      whereClause.OR = [
        { bookingCode: { contains: query, mode: 'insensitive' } },
        { id: query },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { mobileNumber: { contains: query } } },
      ];
    }

    return await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: true,
        bookingItems: { include: { fish: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markBookingComplete(bookingId: string, workerId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { bookingItems: true },
      });

      if (!booking) {
        throw new DomainError('ERR_BOOKING_NOT_FOUND', 'Booking record not found.', 404);
      }

      if (booking.status === BookingStatus.EXPIRED) {
        throw new DomainError('ERR_BOOKING_EXPIRED', 'Cannot complete booking. Booking has expired (48h window passed).', 400);
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new DomainError('ERR_BOOKING_ALREADY_COMPLETED', 'Booking is already marked complete.', 400);
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new DomainError('ERR_BOOKING_NOT_CONFIRMED', 'Cannot complete booking. Booking status must be CONFIRMED.', 400);
      }

      // Decrement physical stock for items using exact reservation batch (strictly required)
      for (const item of booking.bookingItems) {
        const reservationLedger = await tx.inventoryLedger.findFirst({
          where: {
            referenceId: booking.bookingCode,
            fishId: item.fishId,
            changeType: InventoryChangeType.BOOKING_RESERVATION,
          },
        });

        if (!reservationLedger || !reservationLedger.batchId) {
          throw new DomainError(
            'ERR_BOOKING_RESERVATION_NOT_FOUND',
            `Reservation ledger record not found for booking item ${item.fishId}.`,
            409
          );
        }

        const batch = await tx.inventoryBatch.findUnique({
          where: { id: reservationLedger.batchId },
        });

        if (!batch) {
          throw new DomainError(
            'ERR_INVENTORY_RESERVATION_INVALID',
            `Reserved inventory batch no longer exists for booking item ${item.fishId}.`,
            409
          );
        }

        if (batch.reservedQty < item.quantityKg) {
          throw new DomainError(
            'ERR_INVENTORY_RESERVATION_INVALID',
            `Insufficient reserved quantity in batch for item ${item.fishId}. Reserved: ${batch.reservedQty}kg, Required: ${item.quantityKg}kg.`,
            409
          );
        }

        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            physicalQty: { decrement: item.quantityKg },
            reservedQty: { decrement: item.quantityKg },
          },
        });

        const resultingPhysicalQty = batch.physicalQty - item.quantityKg;

        await tx.inventoryLedger.create({
          data: {
            fishId: item.fishId,
            batchId: batch.id,
            changeType: InventoryChangeType.SALE,
            quantityChange: -item.quantityKg,
            resultingQty: resultingPhysicalQty,
            referenceId: booking.bookingCode,
          },
        });
      }

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.COMPLETED },
      });

      return updatedBooking;
    });
  }

  // Idempotent 48-Hour Booking Expiry Job Worker
  static async processExpiredBookings() {
    const expiredPendingBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      include: { bookingItems: true },
    });

    let expiredCount = 0;
    for (const booking of expiredPendingBookings) {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Atomic status check prevents double-processing
        const updated = await tx.booking.updateMany({
          where: { id: booking.id, status: BookingStatus.PENDING },
          data: { status: BookingStatus.EXPIRED },
        });

        if (updated.count === 0) return;

        // Release reserved inventory using exact reservation batch
        for (const item of booking.bookingItems) {
          const reservationLedger = await tx.inventoryLedger.findFirst({
            where: {
              referenceId: booking.bookingCode,
              fishId: item.fishId,
              changeType: InventoryChangeType.BOOKING_RESERVATION,
            },
          });

          if (!reservationLedger || !reservationLedger.batchId) {
            throw new DomainError(
              'ERR_BOOKING_RESERVATION_NOT_FOUND',
              `Reservation ledger record missing for expired booking item ${item.fishId}.`,
              409
            );
          }

          const batch = await tx.inventoryBatch.findUnique({
            where: { id: reservationLedger.batchId },
          });

          if (!batch || batch.reservedQty < item.quantityKg) {
            throw new DomainError(
              'ERR_INVENTORY_RESERVATION_INVALID',
              `Reserved inventory batch missing or insufficient for expired booking item ${item.fishId}.`,
              409
            );
          }

          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: {
              reservedQty: { decrement: item.quantityKg },
              availableQty: { increment: item.quantityKg },
            },
          });

          const resultingAvailableQty = batch.availableQty + item.quantityKg;

          await tx.inventoryLedger.create({
            data: {
              fishId: item.fishId,
              batchId: batch.id,
              changeType: InventoryChangeType.BOOKING_RELEASE,
              quantityChange: item.quantityKg,
              resultingQty: resultingAvailableQty,
              referenceId: `EXPIRY_${booking.bookingCode}`,
            },
          });
        }

        // Restore subscription credit if used
        if (booking.subCreditUsed > 0) {
          const sub = await tx.subscription.findFirst({
            where: { customerId: booking.customerId, status: 'ACTIVE' },
          });

          if (sub) {
            await tx.subscription.update({
              where: { id: sub.id },
              data: { creditBalance: { increment: booking.subCreditUsed } },
            });

            await tx.subscriptionCreditLedger.create({
              data: {
                subscriptionId: sub.id,
                bookingId: booking.id,
                type: CreditLedgerType.CREDIT_REFUND,
                amount: booking.subCreditUsed,
                resultingBalance: sub.creditBalance + booking.subCreditUsed,
              },
            });
          }
        }

        expiredCount++;
      });
    }

    return { processedCount: expiredCount };
  }
}
