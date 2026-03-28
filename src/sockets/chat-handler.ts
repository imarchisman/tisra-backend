import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  ChatMessagePayload,
} from '../types/socket.types';
import { ChatService } from '../services/chat';
import { logger } from '../utils/logger';

export const registerChatHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>
): void => {
  const user = socket.data.user!;

  socket.on('chat:message', async (payload: ChatMessagePayload) => {
    try {
      const { roomCode, content } = payload;

      const message = await ChatService.sendMessage({
        roomCode,
        userId: user.id,
        content,
      });

      // Broadcast message to everyone in the room
      io.to(roomCode).emit('chat:message', {
        id: message.id,
        userId: message.senderId,
        username: message.sender.username,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      });

      logger.info(`Message from ${user.username} in room ${roomCode}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      socket.emit('app:error', { message });
    }
  });
};
