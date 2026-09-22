import { Router } from 'express';
import { AuthModule } from '../modules/authModule';
import { BookingModule } from '../modules/bookingModule';
import { TransactionModule } from '../modules/transactionModule';
import { RealtimeModule } from '../modules/realtimeModule';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/response';

import { BookingStatus } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

const router = Router();

// Worker Auth (Unprotected)
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthModule.workerLogin(email, password);
    return sendSuccess(res, result, 'Worker login successful');
  } catch (err) {
    next(err);
  }
});

// Protected Worker Routes
router.use(authenticateJWT, requireRole(['WORKER', 'ADMIN']));

router.get('/bookings', async (req, res, next) => {
  try {
    const search = req.query.search as string | undefined;
    const rawStatus = req.query.status as string | undefined;

    let validatedStatus: BookingStatus | undefined = undefined;
    if (rawStatus && rawStatus !== 'ALL') {
      if (!Object.values(BookingStatus).includes(rawStatus as BookingStatus)) {
        throw new DomainError(
          'ERR_INVALID_STATUS',
          `Invalid booking status filter: '${rawStatus}'. Allowed values: ${Object.values(BookingStatus).join(', ')}`,
          400
        );
      }
      validatedStatus = rawStatus as BookingStatus;
    }

    const bookings = await BookingModule.getWorkerBookings({ search, status: validatedStatus });
    return sendSuccess(res, bookings, 'Worker bookings retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/bookings/:id/complete', async (req, res, next) => {
  try {
    const booking = await BookingModule.markBookingComplete(req.params.id, req.user!.id);
    return sendSuccess(res, booking, 'Booking pickup completed successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/transactions/collect-cash', async (req, res, next) => {
  try {
    const { customerId, billId, items, useSubscriptionCredit } = req.body;
    const transaction = await TransactionModule.processStoreCheckout({
      customerId,
      workerId: req.user!.id,
      billId,
      items,
      paymentMethod: 'CASH',
      useSubscriptionCredit,
    });

    // Post-commit Socket.io event emission to TV portal
    await RealtimeModule.emitTransactionCompleted(transaction.id);

    return sendSuccess(res, transaction, 'Store cash transaction completed successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
