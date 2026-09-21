import { Router } from 'express';
import { CategoryModule } from '../modules/categoryModule';
import { FishModule } from '../modules/fishModule';
import { AvailabilityModule } from '../modules/availabilityModule';
import { SubscriptionModule } from '../modules/subscriptionModule';
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

export default router;
