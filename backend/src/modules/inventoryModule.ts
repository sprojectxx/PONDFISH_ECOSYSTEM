import { prisma } from '../prismaClient';
import { InventoryChangeType } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

export class InventoryModule {
  static async receiveStockBatch(data: {
    fishId: string;
    batchCode: string;
    receivedQty: number;
    expiryHours?: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      const fish = await tx.fish.findUnique({ where: { id: data.fishId } });
      if (!fish) {
        throw new DomainError('ERR_FISH_NOT_FOUND', 'Fish item not found.', 404);
      }

      const expiryAt = new Date(Date.now() + (data.expiryHours || 48) * 60 * 60 * 1000);

      const batch = await tx.inventoryBatch.create({
        data: {
          fishId: data.fishId,
          batchCode: data.batchCode,
          receivedQty: data.receivedQty,
          physicalQty: data.receivedQty,
          reservedQty: 0.0,
          availableQty: data.receivedQty,
          expiryAt,
        },
      });

      await tx.inventoryLedger.create({
        data: {
          fishId: data.fishId,
          batchId: batch.id,
          changeType: InventoryChangeType.RECEIVING,
          quantityChange: data.receivedQty,
          resultingQty: data.receivedQty,
          referenceId: batch.batchCode,
        },
      });

      return batch;
    });
  }

  static async getInventoryLedger(fishId?: string) {
    const where: any = {};
    if (fishId) where.fishId = fishId;

    return await prisma.inventoryLedger.findMany({
      where,
      include: {
        fish: true,
        batch: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
