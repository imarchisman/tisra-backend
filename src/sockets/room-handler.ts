import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  RoomJoinPayload,
  PlaybackActionPayload,
} from '../types/socket.types';
import { RoomService } from '../services/room';
import { logger } from '../utils/logger';
import { PlaybackState } from '@prisma/client';

export const registerRoomHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>
): void => {
  const user = socket.data.user!;

  socket.on('room:join', async (payload: RoomJoinPayload) => {
    try {
      const { roomCode } = payload;

      // Call service to handle logical join (add participant)
      await RoomService.joinRoom(roomCode, user.id);

      // Socket.IO room join
      socket.join(roomCode);

      // Broadcast to others
      socket.to(roomCode).emit('room:user-joined', {
        userId: user.id,
        username: user.username,
      });

      // Send current state to joined user
      const roomDetails = await RoomService.getRoomDetails(roomCode);
      socket.emit('room:state', {
        isPlaying: roomDetails.playbackState === PlaybackState.PLAYING,
        currentTrackId: roomDetails.currentTrackId,
        positionMs: roomDetails.playbackPosition,
        updatedAt: Date.now(),
      });

      logger.info(`User ${user.username} joined socket room ${roomCode}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to join room';
      socket.emit('app:error', { message });
    }
  });

  socket.on('room:leave', async (payload: RoomJoinPayload) => {
    try {
      const { roomCode } = payload;

      await RoomService.leaveRoom(roomCode, user.id);
      socket.leave(roomCode);

      socket.to(roomCode).emit('room:user-left', { userId: user.id });

      logger.info(`User ${user.username} left socket room ${roomCode}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to leave room';
      socket.emit('app:error', { message });
    }
  });

  socket.on('playback:action', async (payload: PlaybackActionPayload) => {
    try {
      const { roomCode, action, trackId, positionMs } = payload;

      // Update room state in DB (checks host internally in RoomService)
      const updatedRoom = await RoomService.updatePlayback(user.id, roomCode, {
        isPlaying: action === 'play',
        currentTrackId: trackId,
        positionMs: positionMs,
      });

      // Broadcast update to all in room
      io.to(roomCode).emit('playback:update', {
        isPlaying: updatedRoom.playbackState === PlaybackState.PLAYING,
        currentTrackId: updatedRoom.currentTrackId,
        positionMs: updatedRoom.playbackPosition,
        updatedAt: Date.now(),
      });

      logger.info(`User ${user.username} performed ${action} in room ${roomCode}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Playback action failed';
      logger.error(`Playback action failed for ${user.username}: ${message}`);
      socket.emit('app:error', { message });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User ${user.username} disconnected`);
  });
};
