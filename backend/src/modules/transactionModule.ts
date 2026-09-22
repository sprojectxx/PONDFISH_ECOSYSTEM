import { prisma } from '../prismaClient';
import { PaymentMethod, InventoryChangeType, Prisma } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';
import crypto from 'crypto';

export class TransactionModule {
  static calculateFinancials(params: {
    totalBillAmount: number;
    subCreditAvailable: number;
    paymentMethod?: PaymentMethod;
    gatewayFeePercent?: number; // Default 2.0%
  }) {
    const feePercent = params.gatewayFeePercent ?? 2.0;

    const subCreditUsed = Math.min(params.totalBillAmount, Math.max(0, params.subCreditAvailable));
    const extraAmountPayable = Math.max(0, params.totalBillAmount - subCreditUsed);

    // Gateway Fee & 18% GST calculation ONLY for Razorpay payment method
    const isRazorpay = params.paymentMethod === PaymentMethod.RAZORPAY;
    const razorpayGatewayFee = (extraAmountPayable > 0 && isRazorpay)
      ? Number(((extraAmountPayable * feePercent) / 100).toFixed(2))
      : 0.0;
    const gstOnFee18 = (extraAmountPayable > 0 && isRazorpay)
      ? Number((razorpayGatewayFee * 0.18).toFixed(2))
      : 0.0;
    const finalPaidAmount = Number((extraAmountPayable + razorpayGatewayFee + gstOnFee18).toFixed(2));

    return {
      totalBillAmount: Number(params.totalBillAmount.toFixed(2)),
      subCreditUsed: Number(subCreditUsed.toFixed(2)),
      extraAmountPayable: Number(extraAmountPayable.toFixed(2)),
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
    if (!data.items || data.items.length === 0) {
      throw new DomainError('ERR_INVALID_ITEMS', 'Checkout order must contain at least one item.', 400);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let totalBillAmount = 0.0;
      const transactionItemsToCreate: Array<{ fishId: string; quantityKg: number; unitPrice: number; subtotal: number }> = [];

      // Step 1: Pre-validate & deduct inventory atomically for all items
      for (const item of data.items) {
        if (!item.quantityKg || item.quantityKg <= 0) {
          throw new DomainError('ERR_INVALID_QUANTITY', 'Item quantity must be greater than zero.', 400);
        }

        const fish = await tx.fish.findUnique({ where: { id: item.fishId } });
        if (!fish) {
          throw new DomainError('ERR_FISH_NOT_FOUND', `Fish item ${item.fishId} not found.`, 404);
        }

        if (!fish.physicalAvailable) {
          throw new DomainError('ERR_FISH_UNAVAILABLE', `Fish ${fish.name} is physically unavailable.`, 400);
        }

        const subtotal = Number((fish.unitPrice * item.quantityKg).toFixed(2));
        totalBillAmount += subtotal;

        transactionItemsToCreate.push({
          fishId: fish.id,
          quantityKg: item.quantityKg,
          unitPrice: fish.unitPrice,
          subtotal,
        });

        // Search for batch with sufficient physical and available stock
        const batch = await tx.inventoryBatch.findFirst({
          where: {
            fishId: item.fishId,
            physicalQty: { gte: item.quantityKg },
            availableQty: { gte: item.quantityKg },
          },
          orderBy: { receivedAt: 'asc' },
        });

        if (!batch) {
          throw new DomainError('ERR_INVENTORY_INSUFFICIENT', `Insufficient stock for ${fish.name}. Requested: ${item.quantityKg}kg.`, 409);
        }

        // Concurrency-safe atomic deduction
        const updatedBatch = await tx.inventoryBatch.updateMany({
          where: {
            id: batch.id,
            physicalQty: { gte: item.quantityKg },
            availableQty: { gte: item.quantityKg },
          },
          data: {
            physicalQty: { decrement: item.quantityKg },
            availableQty: { decrement: item.quantityKg },
          },
        });

        if (updatedBatch.count === 0) {
          throw new DomainError('ERR_INVENTORY_INSUFFICIENT', `Stock deduction conflict for ${fish.name}. Please retry checkout.`, 409);
        }

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

      totalBillAmount = Number(totalBillAmount.toFixed(2));

      // Step 2: Customer subscription credit check
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

      // Step 3: Financial math calculation passing paymentMethod
      const calc = this.calculateFinancials({
        totalBillAmount,
        subCreditAvailable,
        paymentMethod: data.paymentMethod,
      });

      // Step 4: Atomic Subscription credit debit
      if (subscriptionId && calc.subCreditUsed > 0) {
        const updatedSub = await tx.subscription.updateMany({
          where: {
            id: subscriptionId,
            creditBalance: { gte: calc.subCreditUsed },
          },
          data: {
            creditBalance: { decrement: calc.subCreditUsed },
          },
        });

        if (updatedSub.count === 0) {
          throw new DomainError('ERR_SUBSCRIPTION_CREDIT_CONFLICT', 'Subscription credit balance conflict.', 409);
        }
      }

      // Step 5: High-entropy unique transaction number
      const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
      const transactionNumber = `TXN-${Date.now()}-${randomSuffix}`;

      const transaction = await tx.transaction.create({
        data: {
          transactionNumber,
          billId: data.billId || null,
          customerId: data.customerId,
          workerId: data.workerId || null,
          totalBillAmount: calc.totalBillAmount,
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
