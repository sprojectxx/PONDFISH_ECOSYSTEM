import { Router } from 'express';
import { BookingStatus } from '@prisma/client';
import { AuthModule } from '../modules/authModule';
import { FishModule } from '../modules/fishModule';
import { CategoryModule } from '../modules/categoryModule';
import { InventoryModule } from '../modules/inventoryModule';
import { AvailabilityModule } from '../modules/availabilityModule';
import { SubscriptionModule } from '../modules/subscriptionModule';
import { WorkerModule } from '../modules/workerModule';
import { GPSModule } from '../modules/gpsModule';
import { ReportingModule } from '../modules/reportingModule';
import { AuditModule } from '../modules/auditModule';
import { SystemModule } from '../modules/systemModule';
import { TransactionModule } from '../modules/transactionModule';
import { BookingModule } from '../modules/bookingModule';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { DomainError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const router = Router();

// Admin Auth (Unprotected)
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthModule.adminLogin(email, password);
    return sendSuccess(res, result, 'Admin login successful');
  } catch (err) {
    next(err);
  }
});

// Protected Admin Routes
router.use(authenticateJWT, requireRole(['ADMIN']));

router.get('/fish', async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const fish = await FishModule.getAllFish({ categoryId });
    return sendSuccess(res, fish, 'Fish catalogue retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/fish', async (req, res, next) => {
  try {
    const fish = await FishModule.createFish(req.body);
    return sendSuccess(res, fish, 'Fish item created successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/fish/:id', async (req, res, next) => {
  try {
    const fish = await FishModule.updateFish(req.params.id, req.body);
    return sendSuccess(res, fish, 'Fish item updated successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await CategoryModule.getAllCategories();
    return sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const category = await CategoryModule.createCategory(req.body);
    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.post('/inventory/receive', async (req, res, next) => {
  try {
    const batch = await InventoryModule.receiveStockBatch(req.body);
    return sendSuccess(res, batch, 'Stock batch received successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/inventory/batches', async (req, res, next) => {
  try {
    const fishId = req.query.fishId as string | undefined;
    const batches = await InventoryModule.getAllBatches(fishId);
    return sendSuccess(res, batches, 'Inventory batches retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/inventory/ledger', async (req, res, next) => {
  try {
    const fishId = req.query.fishId as string;
    const ledger = await InventoryModule.getInventoryLedger(fishId);
    return sendSuccess(res, ledger, 'Inventory ledger retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const search = req.query.search as string | undefined;
    const rawStatus = req.query.status as string | undefined;

    let status: BookingStatus | undefined = undefined;
    if (rawStatus && rawStatus.trim().length > 0) {
      if (!Object.values(BookingStatus).includes(rawStatus as BookingStatus)) {
        throw new DomainError('ERR_INVALID_STATUS', `Invalid booking status: ${rawStatus}`, 400);
      }
      status = rawStatus as BookingStatus;
    }

    const bookings = await BookingModule.getWorkerBookings({ search, status });
    return sendSuccess(res, bookings, 'Admin bookings retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', async (_req, res, next) => {
  try {
    const transactions = await TransactionModule.getAllTransactions();
    return sendSuccess(res, transactions, 'All transactions retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/discounts', async (req, res, next) => {
  try {
    const discount = await AvailabilityModule.createDiscount(req.body);
    return sendSuccess(res, discount, 'Discount created successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.post('/workers', async (req, res, next) => {
  try {
    const worker = await WorkerModule.createWorker(req.body);
    return sendSuccess(res, worker, 'Worker account created successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/workers', async (_req, res, next) => {
  try {
    const workers = await WorkerModule.getAllWorkers();
    return sendSuccess(res, workers, 'Workers list retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/gps/journey/active', async (_req, res, next) => {
  try {
    const journey = await GPSModule.getActiveJourney();
    return sendSuccess(res, journey, 'Active GPS journey retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/gps/journey/start', async (req, res, next) => {
  try {
    const { truckNumber, driverName } = req.body;
    if (!truckNumber || !driverName) {
      throw new DomainError('ERR_INVALID_INPUT', 'Truck number and driver name are required.', 400);
    }
    const journey = await GPSModule.startJourney(truckNumber, driverName);
    return sendSuccess(res, journey, 'GPS Journey started successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.post('/gps/journey/publish', async (req, res, next) => {
  try {
    const { journeyId, publish } = req.body;
    if (!journeyId) {
      throw new DomainError('ERR_INVALID_INPUT', 'Journey ID is required.', 400);
    }
    const updated = await GPSModule.publishJourneyToCustomer(journeyId, publish ?? true);
    return sendSuccess(res, updated, `GPS Journey ${publish ? 'published' : 'unpublished'}`);
  } catch (err) {
    next(err);
  }
});

router.post('/gps/journey/stop', async (req, res, next) => {
  try {
    const { journeyId } = req.body;
    if (!journeyId) {
      throw new DomainError('ERR_INVALID_INPUT', 'Journey ID is required.', 400);
    }
    const stopped = await GPSModule.stopJourney(journeyId);
    return sendSuccess(res, stopped, 'GPS Journey stopped successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/gps/position', async (req, res, next) => {
  try {
    const { journeyId, latitude, longitude, speed, heading } = req.body;
    if (!journeyId || latitude === undefined || longitude === undefined) {
      throw new DomainError('ERR_INVALID_INPUT', 'Journey ID, latitude, and longitude are required.', 400);
    }
    const pos = await GPSModule.recordPosition(journeyId, Number(latitude), Number(longitude), speed ? Number(speed) : undefined, heading ? Number(heading) : undefined);
    return sendSuccess(res, pos, 'GPS Position recorded successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/analytics', async (_req, res, next) => {
  try {
    const analytics = await ReportingModule.getExecutiveAnalytics();
    return sendSuccess(res, analytics, 'Executive analytics retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', async (_req, res, next) => {
  try {
    const logs = await AuditModule.getAuditLogs();
    return sendSuccess(res, logs, 'Audit logs retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/settings/:key', async (req, res, next) => {
  try {
    const setting = await SystemModule.getSetting(req.params.key);
    return sendSuccess(res, setting, 'System setting retrieved');
  } catch (err) {
    next(err);
  }
});

router.put('/settings/:key', async (req, res, next) => {
  try {
    const updated = await SystemModule.updateSetting(req.params.key, req.body);
    return sendSuccess(res, updated, 'System setting updated successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
