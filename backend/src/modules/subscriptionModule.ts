import { prisma } from '../prismaClient';
import { CreditLedgerType, Prisma } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

export class SubscriptionModule {
  static async getSubscriptionPlans() {
    return await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
  }

  static async getCustomerSubscription(customerId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        customerId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: {
        plan: true,
        creditLedgers: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    return subscription;
  }

  static async purchaseSubscription(customerId: string, planId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const plan = await tx.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan || !plan.active) {
        throw new DomainError('ERR_PLAN_NOT_FOUND', 'Subscription plan not active or invalid.', 404);
      }

      const expiresAt = new Date(Date.now() + plan.validityDays * 24 * 60 * 60 * 1000);

      const subscription = await tx.subscription.create({
        data: {
          customerId,
          planId: plan.id,
          creditBalance: plan.creditAmount,
          weeklyQtyUsed: 0.0,
          expiresAt,
          status: 'ACTIVE',
        },
      });

      await tx.subscriptionCreditLedger.create({
        data: {
          subscriptionId: subscription.id,
          type: CreditLedgerType.PURCHASE,
          amount: plan.creditAmount,
          resultingBalance: plan.creditAmount,
        },
      });

      return subscription;
    });
  }
}
