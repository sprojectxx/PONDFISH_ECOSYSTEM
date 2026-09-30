import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { logger } from './utils/logger';
import { prisma } from './prismaClient';

dotenv.config();

import jwt from 'jsonwebtoken';
import { getAllowedOrigins } from './utils/corsConfig';
import { getJwtSecret } from './utils/jwtConfig';
import { AuthenticatedUser } from './middleware/authMiddleware';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io Realtime WebSocket Server
export const io = new SocketIOServer(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO Handshake Authentication Middleware & Room Joining
io.use((socket, next) => {
  const authHeader = socket.handshake.headers?.authorization;
  const token =
    socket.handshake.auth?.token ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
    socket.handshake.query?.token;

  if (!token || typeof token !== 'string') {
    // Unauthenticated public/TV display connection
    socket.data.user = { role: 'PUBLIC' };
    socket.join('public');
    socket.join('tv');
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthenticatedUser;
    socket.data.user = decoded;
    if (decoded.role) socket.join(`role:${decoded.role}`);
    if (decoded.id) {
      socket.join(`customer:${decoded.id}`);
      socket.join(`user:${decoded.id}`);
    }
    // Also allow TV display access
    socket.join('tv');
    next();
  } catch {
    // Fallback to public/TV display room on invalid token
    socket.data.user = { role: 'PUBLIC' };
    socket.join('public');
    socket.join('tv');
    next();
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  logger.info(`⚡ Socket Connected: ${socket.id} (Role: ${user?.role || 'PUBLIC'})`);

  socket.on('disconnect', () => {
    logger.info(`⚡ Socket Disconnected: ${socket.id}`);
  });
});

let isShuttingDown = false;

export async function handleGracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      io.close();
      logger.info('Socket.io server closed.');
      await prisma.$disconnect();
      logger.info('Prisma database client disconnected.');
    } catch (err) {
      logger.error('Error during shutdown cleanup:', err);
    } finally {
      process.exit(0);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown timeout reached. Terminating process.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`🚀 PondFish Shared Backend Server Running on Port ${PORT}`);
  });
}

