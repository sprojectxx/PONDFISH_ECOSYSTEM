import { prisma } from '../prismaClient';
import { FreshnessState } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

export class FishModule {
  static async getAllFish(query?: { categoryId?: string; onlineOnly?: boolean }) {
    const where: any = {};
    if (query?.categoryId) where.categoryId = query.categoryId;
    if (query?.onlineOnly) where.onlineBookable = true;

    return await prisma.fish.findMany({
      where,
      include: {
        category: true,
        discounts: { where: { active: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getFishById(id: string) {
    const fish = await prisma.fish.findUnique({
      where: { id },
      include: {
        category: true,
        freshnessRules: true,
        discounts: { where: { active: true } },
        inventoryBatches: { where: { availableQty: { gt: 0 } } },
      },
    });

    if (!fish) {
      throw new DomainError('ERR_FISH_NOT_FOUND', 'Fish item not found.', 404);
    }
    return fish;
  }

  static async createFish(data: {
    categoryId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    unitPrice: number;
    physicalAvailable?: boolean;
    onlineBookable?: boolean;
    freshnessState?: FreshnessState;
  }) {
    return await prisma.fish.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        unitPrice: data.unitPrice,
        physicalAvailable: data.physicalAvailable ?? true,
        onlineBookable: data.onlineBookable ?? false,
        freshnessState: data.freshnessState ?? FreshnessState.GREEN,
      },
    });
  }

  static async updateFish(id: string, data: any) {
    const fish = await prisma.fish.findUnique({ where: { id } });
    if (!fish) {
      throw new DomainError('ERR_FISH_NOT_FOUND', 'Fish item not found.', 404);
    }
    return await prisma.fish.update({ where: { id }, data });
  }
}
