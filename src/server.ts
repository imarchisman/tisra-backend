import 'dotenv/config';
import { createServer } from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { initializeSocketIO } from './sockets';

const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocketIO(httpServer);

const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Connected to database');

    const PORT = env.port || 3000;
    httpServer.listen(PORT, () => {
      logger.info(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

start();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
