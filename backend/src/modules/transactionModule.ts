import { prisma } from '../prismaClient';
import { PaymentMethod, InventoryChangeType, Prisma } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

export class TransactionModule {
  static calculateFinancials(params: {
    totalBillAmount: number;
    subCreditAvailable: number;
    gatewayFeePercent?: number; // Default 2.0%
  }) {
    const feePercent = params.gatewayFeePercent ?? 2.0;

    const subCreditUsed = Math.min(params.totalBillAmount, params.subCreditAvailable);
    const extraAmountPayable = Math.max(0, params.totalBillAmount - subCreditUsed);

    // Gateway Fee & 18% GST calculation
    const razorpayGatewayFee = extraAmountPayable > 0 ? (extraAmountPayable * feePercent) / 100 : 0.0;
    const gstOnFee18 = extraAmountPayable > 0 ? razorpayGatewayFee * 0.18 : 0.0;
    const finalPaidAmount = extraAmountPayable + razorpayGatewayFee + gstOnFee18;

    return {
      totalBillAmount: params.totalBillAmount,
      subCreditUsed,
      extraAmountPayable,
      razorpayGatewayFee,
      gstOnFee18,
      finalPaidAmount,
    };
  }

  static async processStoreCheckout(data: {
    customerId: string;
    workerId?: string;
    billId?: string;
    items: Array<{ fishId: string; quantityKg: number }>;
    paymentMethod: PaymentMethod;
    useSubscriptionCredit?: boolean;
  }) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let totalBillAmount = 0.0;
      const transactionItemsToCreate: Array<{ fishId: string; quantityKg: number; unitPrice: number; subtotal: number }> = [];

      for (const item of data.items) {
        const fish = await tx.fish.findUnique({ where: { id: item.fishId } });
        if (!fish || !fish.physicalAvailable) {
          throw new DomainError('ERR_FISH_UNAVAILABLE', `Fish ${fish?.name || item.fishId} is physically unavailable.`, 400);
        }

        const subtotal = fish.unitPrice * item.quantityKg;
        totalBillAmount += subtotal;

        transactionItemsToCreate.push({
          fishId: fish.id,
          quantityKg: item.quantityKg,
          unitPrice: fish.unitPrice,
          subtotal,
        });

        // Deduct physical inventory
        const batch = await tx.inventoryBatch.findFirst({
          where: { fishId: item.fishId, physicalQty: { gte: item.quantityKg } },
          orderBy: { receivedAt: 'asc' },
        });

        if (batch) {
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: {
              physicalQty: { decrement: item.quantityKg },
              availableQty: { decrement: item.quantityKg },
            },
          });

          await tx.inventoryLedger.create({
            data: {
              fishId: item.fishId,
              batchId: batch.id,
              changeType: InventoryChangeType.SALE,
              quantityChange: -item.quantityKg,
              resultingQty: batch.physicalQty - item.quantityKg,
              referenceId: 'STORE_CHECKOUT',
            },
          });
        }
      }

      // Customer subscription credit check
      let subCreditAvailable = 0.0;
      let subscriptionId: string | null = null;

      if (data.useSubscriptionCredit) {
        const sub = await tx.subscription.findFirst({
          where: { customerId: data.customerId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        });
        if (sub) {
          subCreditAvailable = sub.creditBalance;
          subscriptionId = sub.id;
        }
      }

      const calc = this.calculateFinancials({ totalBillAmount, subCreditAvailable });

      // Debit subscription credit if used
      if (subscriptionId && calc.subCreditUsed > 0) {
        await tx.subscription.update({
          where: { id: subscriptionId },
          data: { creditBalance: { decrement: calc.subCreditUsed } },
        });
      }

      const transactionNumber = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const transaction = await tx.transaction.create({
        data: {
          transactionNumber,
          billId: data.billId || null,
          customerId: data.customerId,
          workerId: data.workerId || null,
          totalBillAmount,
          subCreditUsed: calc.subCreditUsed,
          extraAmountPayable: calc.extraAmountPayable,
          razorpayGatewayFee: calc.razorpayGatewayFee,
          gstOnFee18: calc.gstOnFee18,
          finalPaidAmount: calc.finalPaidAmount,
          paymentMethod: data.paymentMethod,
          status: 'COMPLETED',
          transactionItems: {
            create: transactionItemsToCreate,
          },
        },
        include: {
          transactionItems: { include: { fish: true } },
          customer: true,
        },
      });

      return transaction;
    });
  }
}
