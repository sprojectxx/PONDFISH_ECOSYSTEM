import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { logger } from './utils/logger';
import { prisma } from './prismaClient';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

export function getAllowedOrigins(): string | string[] {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (process.env.NODE_ENV === 'production') {
    if (allowed && allowed.trim().length > 0) {
      return allowed.split(',').map((item) => item.trim()).filter(Boolean);
    }
    // Return explicit empty array or fallback in production to avoid '*' wildcard
    return [];
  }
  return '*';
}

// Socket.io Realtime WebSocket Server
export const io = new SocketIOServer(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info(`⚡ Socket Connected: ${socket.id}`);

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

server.listen(PORT, () => {
  logger.info(`🚀 PondFish Shared Backend Server Running on Port ${PORT}`);
});

