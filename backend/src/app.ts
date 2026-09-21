import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/response';

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

// Base Health Check
app.get('/health', (_req, res) => {
  return sendSuccess(res, { status: 'ONLINE', timestamp: new Date() }, 'PondFish Shared Backend System Operational');
});

// Global Error Handler
app.use(errorHandler);

export default app;
