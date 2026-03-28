import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData, ChatMessagePayload } from '../types/socket.types';
import { ChatService } from '../services/chat';
import { logger } from '../utils/logger';

export const registerChatHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, any, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, any, SocketData>
) => {
  const user = (socket as any).user;

  socket.on('chat:message', async (payload: ChatMessagePayload) => {
    try {
      const { roomCode, content } = payload;

      const message: any = await ChatService.sendMessage({
        roomCode,
        userId: user.id,
        content
      });

      // Broadcast message to everyone in the room
      io.to(roomCode).emit('chat:message', {
        id: message.id,
        userId: message.senderId,
        username: message.sender.username,
        content: message.content,
        createdAt: message.createdAt.toISOString()
      });

      logger.info(`Message from ${user.username} in room ${roomCode}`);
    } catch (error: any) {
      socket.emit('app:error', { message: error.message || 'Failed to send message' });
    }
  });
};
