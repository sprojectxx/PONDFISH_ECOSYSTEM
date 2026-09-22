import { Router } from 'express';
import { AuthModule } from '../modules/authModule';
import { CustomerModule } from '../modules/customerModule';
import { SubscriptionModule } from '../modules/subscriptionModule';
import { BookingModule } from '../modules/bookingModule';
import { BillProcessingModule } from '../modules/billProcessingModule';
import { TransactionModule } from '../modules/transactionModule';
import { PaymentModule } from '../modules/paymentModule';
import { GPSModule } from '../modules/gpsModule';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/response';

const router = Router();

// Auth Endpoints (Unprotected)
router.post('/auth/send-otp', async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    const result = await AuthModule.sendOTP(mobileNumber);
    return sendSuccess(res, result, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/auth/verify-otp', async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body;
    const result = await AuthModule.verifyOTP(mobileNumber, otp);
    return sendSuccess(res, result, 'OTP verified successfully');
  } catch (err) {
    next(err);
  }
});

// Protected Customer Routes
router.use(authenticateJWT, requireRole(['CUSTOMER']));

router.get('/profile', async (req, res, next) => {
  try {
    const profile = await CustomerModule.getProfile(req.user!.id);
    return sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const { name, age, area } = req.body;
    const updated = await CustomerModule.updateProfile(req.user!.id, { name, age, area });
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/subscription', async (req, res, next) => {
  try {
    const sub = await SubscriptionModule.getCustomerSubscription(req.user!.id);
    return sendSuccess(res, sub, 'Customer subscription retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/subscription/purchase', async (req, res, next) => {
  try {
    const { planId } = req.body;
    const sub = await SubscriptionModule.purchaseSubscription(req.user!.id, planId);
    return sendSuccess(res, sub, 'Subscription purchased successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/bookings', async (req, res, next) => {
  try {
    const { items, useSubscriptionCredit } = req.body;
    const booking = await BookingModule.createBooking({
      customerId: req.user!.id,
      items,
      useSubscriptionCredit,
    });
    return sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/bookings/:id', async (req, res, next) => {
  try {
    const booking = await BookingModule.getBookingById(req.params.id, req.user!.id);
    return sendSuccess(res, booking, 'Booking details retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/bills/scan', async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    const result = await BillProcessingModule.scanBill(req.user!.id, imageUrl);
    return sendSuccess(res, result, 'Bill scanned and extracted successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/bills/verify-extraction', async (req, res, next) => {
  try {
    const { billId, manualBillId } = req.body;
    const updated = await BillProcessingModule.verifyManualBillId(billId, manualBillId);
    return sendSuccess(res, updated, 'Manual Bill ID verified successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/payments/create-order', async (req, res, next) => {
  try {
    const { amount } = req.body;
    const order = await PaymentModule.createRazorpayOrder(amount);
    return sendSuccess(res, order, 'Razorpay order created');
  } catch (err) {
    next(err);
  }
});

router.post('/payments/verify', async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, bookingId, transactionId } = req.body;
    const payment = await PaymentModule.verifyRazorpayPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      bookingId,
      transactionId,
    });
    return sendSuccess(res, payment, 'Razorpay payment verified successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/gps/live', async (_req, res, next) => {
  try {
    const journey = await GPSModule.getLiveCustomerJourney();
    return sendSuccess(res, journey, 'Live truck GPS journey retrieved');
  } catch (err) {
    next(err);
  }
});

export default router;
