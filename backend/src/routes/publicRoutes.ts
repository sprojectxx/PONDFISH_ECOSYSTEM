import { Router } from 'express';
import { CategoryModule } from '../modules/categoryModule';
import { FishModule } from '../modules/fishModule';
import { AvailabilityModule } from '../modules/availabilityModule';
import { SubscriptionModule } from '../modules/subscriptionModule';
import { ReportingModule } from '../modules/reportingModule';
import { GPSModule } from '../modules/gpsModule';
import { PaymentModule } from '../modules/paymentModule';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await CategoryModule.getAllCategories();
    return sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/fish', async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string;
    const onlineOnly = req.query.onlineOnly === 'true';
    const fishList = await FishModule.getAllFish({ categoryId, onlineOnly });
    return sendSuccess(res, fishList, 'Fish catalog retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/fish/:id', async (req, res, next) => {
  try {
    const fish = await FishModule.getFishById(req.params.id);
    return sendSuccess(res, fish, 'Fish details retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/discounts', async (_req, res, next) => {
  try {
    const discounts = await AvailabilityModule.getActiveDiscounts();
    return sendSuccess(res, discounts, 'Active discounts retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/subscription-plans', async (_req, res, next) => {
  try {
    const plans = await SubscriptionModule.getSubscriptionPlans();
    return sendSuccess(res, plans, 'Subscription plans retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/transactions/recent', async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const transactions = await ReportingModule.getRecentPublicTransactions(limit);
    return sendSuccess(res, transactions, 'Recent transactions retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/gps/live', async (_req, res, next) => {
  try {
    const journey = await GPSModule.getLiveCustomerJourney();
    return sendSuccess(res, journey, 'Live truck journey retrieved successfully');
  } catch (err) {
    next(err);
  }
});

// Server-to-server Razorpay Webhook Callback Endpoint (Unprotected)
router.post('/webhooks/razorpay', async (req, res, next) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature']) as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const result = await PaymentModule.handleRazorpayWebhook(rawBody, signature, req.body);
    return sendSuccess(res, result, 'Razorpay webhook processed successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
