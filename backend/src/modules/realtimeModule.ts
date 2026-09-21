import { io } from '../server';
import { prisma } from '../prismaClient';
import { logger } from '../utils/logger';

export class RealtimeModule {
  static async emitTransactionCompleted(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        customer: true,
        transactionItems: { include: { fish: true } },
      },
    });

    if (!transaction) return;

    const payload = {
      transactionId: transaction.id,
      transactionNumber: transaction.transactionNumber,
      customerName: transaction.customer?.name || 'In-Store Customer',
      totalBillAmount: transaction.totalBillAmount,
      finalPaidAmount: transaction.finalPaidAmount,
      paymentMethod: transaction.paymentMethod,
      items: transaction.transactionItems.map((item) => ({
        fishName: item.fish.name,
        quantityKg: item.quantityKg,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      timestamp: transaction.createdAt,
    };

    // Save event log
    await prisma.realtimeEvent.create({
      data: {
        eventType: 'TRANSACTION_COMPLETED',
        payload: JSON.stringify(payload),
      },
    });

    logger.info(`📢 Socket.io Emitting TRANSACTION_COMPLETED for ${transaction.transactionNumber}`);
    // Broadcast event to connected clients (TV Portal, Web, Apps)
    io.emit('TRANSACTION_COMPLETED', payload);
  }

  static async emitGPSLocationUpdate(journeyId: string, latitude: number, longitude: number) {
    const payload = { journeyId, latitude, longitude, timestamp: new Date() };

    await prisma.realtimeEvent.create({
      data: {
        eventType: 'GPS_LOCATION_UPDATE',
        payload: JSON.stringify(payload),
      },
    });

    io.emit('GPS_LOCATION_UPDATE', payload);
  }
}
