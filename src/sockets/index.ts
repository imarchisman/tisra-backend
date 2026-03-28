import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../types/socket.types';
import { socketAuthMiddleware } from '../middlewares/socket-auth';
import { registerRoomHandlers } from './room-handler';
import { registerChatHandlers } from './chat-handler';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const initializeSocketIO = (
  httpServer: HttpServer
): Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData> => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Apply Auth Middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const user = socket.data.user!;
    logger.info(`New socket connection: ${socket.id} (User: ${user.username})`);

    // Register handlers
    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);
  });

  return io;
};
