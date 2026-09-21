import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io Realtime WebSocket Server
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info(`⚡ Socket Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`⚡ Socket Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  logger.info(`🚀 PondFish Shared Backend Server Running on Port ${PORT}`);
});
