import { AuthModule } from '../modules/authModule';
import { FishModule } from '../modules/fishModule';
import { InventoryModule } from '../modules/inventoryModule';
import { TransactionModule } from '../modules/transactionModule';
import { GPSModule } from '../modules/gpsModule';
import { DomainError } from '../middleware/errorHandler';
import { FreshnessState, JourneyStatus } from '@prisma/client';
import { prisma } from '../prismaClient';

jest.mock('../prismaClient', () => {
  return {
    prisma: {
      admin: {
        findUnique: jest.fn(),
      },
      fish: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      inventoryBatch: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      inventoryLedger: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      transaction: {
        findMany: jest.fn(),
      },
      gPSJourney: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      gPSPosition: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };
});

describe('Admin Portal Operations & Workflow Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Admin Authentication', () => {
    it('rejects authentication when admin user is not found', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        AuthModule.adminLogin('nonexistent@pondfish.com', 'Admin@123456')
      ).rejects.toThrow(DomainError);
    });
  });

  describe('2. Fish Catalogue & Price Management', () => {
    it('fetches all fish items including category data', async () => {
      const mockFish = [
        { id: 'fish-1', name: 'Pond Murrel', unitPrice: 350, freshnessState: FreshnessState.GREEN, category: { name: 'Freshwater' } },
      ];
      (prisma.fish.findMany as jest.Mock).mockResolvedValueOnce(mockFish);

      const result = await FishModule.getAllFish();
      expect(result).toEqual(mockFish);
      expect(prisma.fish.findMany).toHaveBeenCalled();
    });

    it('creates a new fish item with price and freshness parameters', async () => {
      const fishData = {
        categoryId: 'cat-1',
        name: 'Fresh Rohu',
        unitPrice: 220,
        freshnessState: FreshnessState.GREEN,
        onlineBookable: true,
        physicalAvailable: true,
      };

      (prisma.fish.create as jest.Mock).mockResolvedValueOnce({ id: 'fish-new-1', ...fishData });

      const result = await FishModule.createFish(fishData);
      expect(result.id).toBe('fish-new-1');
      expect(prisma.fish.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Fresh Rohu',
            unitPrice: 220,
          }),
        })
      );
    });

    it('updates fish price and online booking status', async () => {
      (prisma.fish.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'fish-1', name: 'Pond Murrel' });
      (prisma.fish.update as jest.Mock).mockResolvedValueOnce({ id: 'fish-1', unitPrice: 380, onlineBookable: false });

      const result = await FishModule.updateFish('fish-1', { unitPrice: 380, onlineBookable: false });
      expect(result.unitPrice).toBe(380);
      expect(result.onlineBookable).toBe(false);
    });
  });

  describe('3. Inventory Stock Receiving & Ledger', () => {
    it('receives stock batch atomically and logs receiving inventory ledger', async () => {
      const stockData = {
        fishId: 'fish-1',
        batchCode: 'BATCH-2026-MURREL-01',
        receivedQty: 50,
        expiryHours: 48,
      };

      const mockBatch = {
        id: 'batch-new-1',
        fishId: 'fish-1',
        batchCode: stockData.batchCode,
        receivedQty: 50,
        physicalQty: 50,
        reservedQty: 0,
        availableQty: 50,
        expiryAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        const tx = {
          fish: { findUnique: jest.fn().mockResolvedValue({ id: 'fish-1', name: 'Pond Murrel' }) },
          inventoryBatch: { create: jest.fn().mockResolvedValue(mockBatch) },
          inventoryLedger: { create: jest.fn().mockResolvedValue({ id: 'ledger-1' }) },
        };
        return cb(tx);
      });

      const result = await InventoryModule.receiveStockBatch(stockData);
      expect(result.batchCode).toBe('BATCH-2026-MURREL-01');
    });

    it('queries inventory batches by fish id filter', async () => {
      (prisma.inventoryBatch.findMany as jest.Mock).mockResolvedValueOnce([]);

      await InventoryModule.getAllBatches('fish-1');
      expect(prisma.inventoryBatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { fishId: 'fish-1' },
        })
      );
    });
  });

  describe('4. Financial Transactions Listing', () => {
    it('queries all financial transactions with customer and booking relations', async () => {
      const mockTxns = [
        {
          id: 'txn-1',
          transactionNumber: 'TXN-10001',
          totalBillAmount: 500,
          subCreditUsed: 200,
          extraAmountPayable: 300,
          razorpayGatewayFee: 6.0,
          gstOnFee18: 1.08,
          finalPaidAmount: 307.08,
          paymentMethod: 'RAZORPAY',
          status: 'COMPLETED',
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValueOnce(mockTxns);

      const result = await TransactionModule.getAllTransactions();
      expect(result).toEqual(mockTxns);
      expect(prisma.transaction.findMany).toHaveBeenCalled();
    });
  });

  describe('5. OneLap Live Truck GPS Controller', () => {
    it('starts a new live GPS truck journey', async () => {
      const mockJourney = {
        id: 'gps-j-1',
        truckNumber: 'AP-39-TF-1001',
        driverName: 'Ramesh Kumar',
        status: JourneyStatus.LIVE,
        publishedToCustomer: false,
      };

      (prisma.gPSJourney.create as jest.Mock).mockResolvedValueOnce(mockJourney);

      const result = await GPSModule.startJourney('AP-39-TF-1001', 'Ramesh Kumar');
      expect(result.truckNumber).toBe('AP-39-TF-1001');
      expect(result.status).toBe(JourneyStatus.LIVE);
    });

    it('toggles publishing journey to customer app', async () => {
      (prisma.gPSJourney.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'gps-j-1' });
      (prisma.gPSJourney.update as jest.Mock).mockResolvedValueOnce({ id: 'gps-j-1', publishedToCustomer: true });

      const result = await GPSModule.publishJourneyToCustomer('gps-j-1', true);
      expect(result.publishedToCustomer).toBe(true);
    });

    it('stops active GPS journey and clears publishing state', async () => {
      (prisma.gPSJourney.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'gps-j-1' });
      (prisma.gPSJourney.update as jest.Mock).mockResolvedValueOnce({
        id: 'gps-j-1',
        status: JourneyStatus.STOPPED,
        publishedToCustomer: false,
      });

      const result = await GPSModule.stopJourney('gps-j-1');
      expect(result.status).toBe(JourneyStatus.STOPPED);
      expect(result.publishedToCustomer).toBe(false);
    });
  });
});
