import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';

export class CustomerModule {
  static async getProfile(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        subscriptions: { where: { status: 'ACTIVE' }, include: { plan: true } },
      },
    });
    if (!customer) {
      throw new DomainError('ERR_CUSTOMER_NOT_FOUND', 'Customer profile not found.', 404);
    }
    return customer;
  }

  static async updateProfile(customerId: string, data: { name?: string; age?: number; area?: string }) {
    return await prisma.customer.update({
      where: { id: customerId },
      data,
    });
  }
}
