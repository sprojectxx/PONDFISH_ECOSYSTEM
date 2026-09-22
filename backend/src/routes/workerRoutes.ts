import { Router } from 'express';
import { AuthModule } from '../modules/authModule';
import { BookingModule } from '../modules/bookingModule';
import { TransactionModule } from '../modules/transactionModule';
import { RealtimeModule } from '../modules/realtimeModule';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/response';

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
    const status = req.query.status as any | undefined;
    const bookings = await BookingModule.getWorkerBookings({ search, status });
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
