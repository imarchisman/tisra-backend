import { RoomRepository } from '../../repositories/room';
import { RoomParticipantRepository } from '../../repositories/room-participant';
import { CreateRoomInput, RoomDetails, RoomParticipantDetails } from '../../types/room.types';
import { generateRoomCode } from './helper';
import { NotFoundError, ForbiddenError, ConflictError } from '../../errors';
import { PlaybackState } from '@prisma/client';

export class RoomService {
  static async createRoom(userId: string, data: CreateRoomInput): Promise<RoomDetails> {
    const code = generateRoomCode();
    const room = await RoomRepository.create({
      ...data,
      code,
      hostId: userId,
    });

    // Host automatically joins the room
    await RoomParticipantRepository.add(room.id, userId);

    return this.getRoomDetails(code);
  }

  static async joinRoom(roomCode: string, userId: string): Promise<RoomDetails> {
    const room = await RoomRepository.findByCode(roomCode);
    if (!room) throw new NotFoundError('Room');
    if (!room.isActive) throw new ConflictError('Room is no longer active');

    const participantCount = await RoomParticipantRepository.getParticipantCount(room.id);
    if (participantCount >= room.maxParticipants) {
      throw new ConflictError('Room is full');
    }

    const isMember = await RoomParticipantRepository.findByRoomAndUser(room.id, userId);
    if (!isMember) {
      await RoomParticipantRepository.add(room.id, userId);
    }

    return this.getRoomDetails(roomCode);
  }

  static async leaveRoom(roomCode: string, userId: string): Promise<void> {
    const room = await RoomRepository.findByCode(roomCode);
    if (!room) throw new NotFoundError('Room');

    if (room.hostId === userId) {
      await RoomRepository.deactivate(room.id);
    }

    await RoomParticipantRepository.remove(room.id, userId);
  }

  static async kickUser(hostId: string, roomId: string, targetUserId: string): Promise<void> {
    const room = await RoomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Room');
    if (room.hostId !== hostId) throw new ForbiddenError('Only the host can kick users');
    if (hostId === targetUserId) throw new ConflictError('You cannot kick yourself');

    await RoomParticipantRepository.remove(roomId, targetUserId);
  }

  static async closeRoom(hostId: string, roomId: string): Promise<void> {
    const room = await RoomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Room');
    if (room.hostId !== hostId) throw new ForbiddenError('Only the host can close the room');

    await RoomRepository.deactivate(roomId);
  }

  static async updatePlayback(
    userId: string,
    roomCode: string,
    data: { isPlaying: boolean; currentTrackId?: string | null; positionMs?: number }
  ) {
    const room = await RoomRepository.findByCode(roomCode);
    if (!room) throw new NotFoundError('Room');
    if (room.hostId !== userId) throw new ForbiddenError('Only the host can control playback');

    return RoomRepository.update(room.id, {
      playbackState: data.isPlaying ? PlaybackState.PLAYING : PlaybackState.PAUSED,
      currentTrackId: data.currentTrackId !== undefined ? data.currentTrackId : undefined,
      playbackPosition: data.positionMs !== undefined ? data.positionMs : undefined,
    });
  }

  static async getRoomDetails(code: string): Promise<RoomDetails> {
    const room = await RoomRepository.findByCode(code);
    if (!room) throw new NotFoundError('Room');

    return {
      id: room.id,
      code: room.code,
      name: room.name,
      hostId: room.hostId,
      maxParticipants: room.maxParticipants,
      isActive: room.isActive,
      currentTrackId: room.currentTrackId,
      playbackState: room.playbackState,
      playbackPosition: room.playbackPosition,
      participants: room.participants.map((p: RoomParticipantDetails) => ({
        id: p.user.id,
        username: p.user.username,
        displayName: p.user.displayName,
        avatarUrl: p.user.avatarUrl,
        joinedAt: p.joinedAt,
      })),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
