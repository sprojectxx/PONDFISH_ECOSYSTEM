import { prisma } from '../prismaClient';

export class AvailabilityModule {
  static async getActiveDiscounts() {
    return await prisma.discount.findMany({
      where: {
        active: true,
        startsAt: { lte: new Date() },
        expiresAt: { gte: new Date() },
      },
      include: { fish: true },
    });
  }

  static async createDiscount(data: {
    discountCode: string;
    fishId?: string;
    discountPercent?: number;
    flatDiscountAmount?: number;
    startsAt: Date;
    expiresAt: Date;
  }) {
    return await prisma.discount.create({
      data: {
        discountCode: data.discountCode,
        fishId: data.fishId || null,
        discountPercent: data.discountPercent || null,
        flatDiscountAmount: data.flatDiscountAmount || null,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
        active: true,
      },
    });
  }
}
