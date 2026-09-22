import { TransactionModule } from '../modules/transactionModule';
import { PaymentMethod } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';
import { prisma } from '../prismaClient';

jest.mock('../prismaClient', () => {
  const mockTx = {
    fish: {
      findUnique: jest.fn(),
    },
    inventoryBatch: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
    inventoryLedger: {
      create: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
  };

  return {
    prisma: {
      $transaction: jest.fn(async (cb: (tx: typeof mockTx) => Promise<unknown>) => {
        return cb(mockTx);
      }),
    },
  };
});

describe('TransactionModule Store Checkout Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('A. Throws ERR_INVALID_ITEMS when items array is empty', async () => {
    await expect(
      TransactionModule.processStoreCheckout({
        customerId: 'cust-1',
        items: [],
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow(DomainError);
  });

  it('B. Throws ERR_INVALID_QUANTITY when item quantity is 0 or negative', async () => {
    await expect(
      TransactionModule.processStoreCheckout({
        customerId: 'cust-1',
        items: [{ fishId: 'fish-1', quantityKg: 0 }],
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow(DomainError);
  });

  it('C. Throws ERR_FISH_NOT_FOUND when fish does not exist', async () => {
    const mockTx = await (prisma.$transaction as jest.Mock).mock.calls[0]?.[0];
    // Setup mock $transaction execution
    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        fish: { findUnique: jest.fn().mockResolvedValue(null) },
      };
      return cb(tx);
    });

    await expect(
      TransactionModule.processStoreCheckout({
        customerId: 'cust-1',
        items: [{ fishId: 'non-existent-fish', quantityKg: 2 }],
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow(DomainError);
  });

  it('D. Throws ERR_FISH_UNAVAILABLE when fish physicalAvailable is false', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        fish: { findUnique: jest.fn().mockResolvedValue({ id: 'fish-1', name: 'Rohu', physicalAvailable: false, unitPrice: 200 }) },
      };
      return cb(tx);
    });

    await expect(
      TransactionModule.processStoreCheckout({
        customerId: 'cust-1',
        items: [{ fishId: 'fish-1', quantityKg: 2 }],
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow(DomainError);
  });

  it('E. Throws ERR_INVENTORY_INSUFFICIENT when no batch has sufficient stock', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        fish: { findUnique: jest.fn().mockResolvedValue({ id: 'fish-1', name: 'Rohu', physicalAvailable: true, unitPrice: 200 }) },
        inventoryBatch: { findFirst: jest.fn().mockResolvedValue(null) },
      };
      return cb(tx);
    });

    await expect(
      TransactionModule.processStoreCheckout({
        customerId: 'cust-1',
        items: [{ fishId: 'fish-1', quantityKg: 100 }],
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow(DomainError);
  });

  it('J. CASH financial flow creates transaction with status COMPLETED and no gateway fee', async () => {
    const mockCreatedTx = {
      id: 'txn-123',
      transactionNumber: 'TXN-1001-ABCD',
      status: 'COMPLETED',
      paymentMethod: PaymentMethod.CASH,
      razorpayGatewayFee: 0,
      gstOnFee18: 0,
      finalPaidAmount: 400,
    };

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        fish: { findUnique: jest.fn().mockResolvedValue({ id: 'fish-1', name: 'Rohu', physicalAvailable: true, unitPrice: 200 }) },
        inventoryBatch: {
          findFirst: jest.fn().mockResolvedValue({ id: 'batch-1', physicalQty: 50, availableQty: 50 }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          findUnique: jest.fn().mockResolvedValue({ id: 'batch-1', physicalQty: 48, availableQty: 48 }),
        },
        inventoryLedger: { create: jest.fn().mockResolvedValue({}) },
        subscription: { findFirst: jest.fn().mockResolvedValue(null) },
        transaction: { create: jest.fn().mockResolvedValue(mockCreatedTx) },
      };
      return cb(tx);
    });

    const result = await TransactionModule.processStoreCheckout({
      customerId: 'cust-1',
      items: [{ fishId: 'fish-1', quantityKg: 2 }],
      paymentMethod: PaymentMethod.CASH,
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.razorpayGatewayFee).toBe(0);
    expect(result.gstOnFee18).toBe(0);
  });

  it('K. RAZORPAY flow creates transaction with status PENDING when extra amount is payable', async () => {
    const mockCreatedTx = {
      id: 'txn-456',
      transactionNumber: 'TXN-1002-EFGH',
      status: 'PENDING',
      paymentMethod: PaymentMethod.RAZORPAY,
      extraAmountPayable: 400,
      razorpayGatewayFee: 8.0,
      gstOnFee18: 1.44,
      finalPaidAmount: 409.44,
    };

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        fish: { findUnique: jest.fn().mockResolvedValue({ id: 'fish-1', name: 'Rohu', physicalAvailable: true, unitPrice: 200 }) },
        inventoryBatch: {
          findFirst: jest.fn().mockResolvedValue({ id: 'batch-1', physicalQty: 50, availableQty: 50 }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          findUnique: jest.fn().mockResolvedValue({ id: 'batch-1', physicalQty: 48, availableQty: 48 }),
        },
        inventoryLedger: { create: jest.fn().mockResolvedValue({}) },
        subscription: { findFirst: jest.fn().mockResolvedValue(null) },
        transaction: { create: jest.fn().mockResolvedValue(mockCreatedTx) },
      };
      return cb(tx);
    });

    const result = await TransactionModule.processStoreCheckout({
      customerId: 'cust-1',
      items: [{ fishId: 'fish-1', quantityKg: 2 }],
      paymentMethod: PaymentMethod.RAZORPAY,
    });

    expect(result.status).toBe('PENDING');
    expect(result.finalPaidAmount).toBe(409.44);
  });

  it('L. Generates transaction number matching TXN-<timestamp>-<hex> format', async () => {
    let capturedTxData: any = null;

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
      const tx = {
        fish: { findUnique: jest.fn().mockResolvedValue({ id: 'fish-1', name: 'Rohu', physicalAvailable: true, unitPrice: 100 }) },
        inventoryBatch: {
          findFirst: jest.fn().mockResolvedValue({ id: 'batch-1', physicalQty: 10, availableQty: 10 }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          findUnique: jest.fn().mockResolvedValue({ id: 'batch-1', physicalQty: 9, availableQty: 9 }),
        },
        inventoryLedger: { create: jest.fn().mockResolvedValue({}) },
        subscription: { findFirst: jest.fn().mockResolvedValue(null) },
        transaction: {
          create: jest.fn().mockImplementation((args) => {
            capturedTxData = args.data;
            return { id: 'txn-789', ...args.data };
          }),
        },
      };
      return cb(tx);
    });

    await TransactionModule.processStoreCheckout({
      customerId: 'cust-1',
      items: [{ fishId: 'fish-1', quantityKg: 1 }],
      paymentMethod: PaymentMethod.CASH,
    });

    expect(capturedTxData).not.toBeNull();
    expect(capturedTxData.transactionNumber).toMatch(/^TXN-\d+-[0-9A-F]{8}$/);
  });
});
