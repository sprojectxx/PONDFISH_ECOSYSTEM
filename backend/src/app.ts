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

import { getAllowedOrigins } from './utils/corsConfig';

const app = express();

// Security HTTP headers & strict CORS configuration
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = getAllowedOrigins();
      if (allowed === '*') {
        return callback(null, true);
      }
      if (!origin) {
        // Allow requests with no origin (like mobile native app or curl)
        return callback(null, true);
      }
      if (Array.isArray(allowed)) {
        if (allowed.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS policy'));
      }
      if (allowed === origin) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true,
  })
);

// Body parsers with rawBody retention for webhook signature verification
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for public endpoints
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ERR_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});
app.use('/api/v1/public', publicLimiter);

// Strict Rate limiting for sensitive authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 attempts per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ERR_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

app.use('/api/v1/customer/auth/send-otp', authLimiter);
app.use('/api/v1/customer/auth/verify-otp', authLimiter);
app.use('/api/v1/worker/auth/login', authLimiter);
app.use('/api/v1/admin/auth/login', authLimiter);

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
