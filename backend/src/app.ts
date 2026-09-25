import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/response';
import publicRoutes from './routes/publicRoutes';
import customerRoutes from './routes/customerRoutes';
import workerRoutes from './routes/workerRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Security HTTP headers & CORS
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for public endpoints
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    error: {
      code: 'ERR_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});
app.use('/api/v1/public', publicLimiter);

// API Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/worker', workerRoutes);
app.use('/api/v1/admin', adminRoutes);

import { prisma } from './prismaClient';

// Base Health Check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(
      res,
      { status: 'ONLINE', database: 'CONNECTED', timestamp: new Date() },
      'PondFish Shared Backend System Operational'
    );
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'ERR_SERVICE_UNAVAILABLE',
        message: 'Backend system degraded: Database connectivity check failed.',
      },
      data: { status: 'DEGRADED', database: 'DISCONNECTED', timestamp: new Date() },
    });
  }
});

// Global Error Handler
app.use(errorHandler);

export default app;
