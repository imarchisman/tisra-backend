import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const server: http.Server = http.createServer(app);

// Initialize Socket.IO (Empty for now, handlers will be added in Prompt 7)
const io = new SocketServer(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

const PORT: number = env.port;

server.listen(PORT, () => {
  logger.info(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    message: error.message,
    stack: error.stack,
  });
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
