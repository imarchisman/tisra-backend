import { ChatMessageRepository } from '../../repositories/chat-message';
import { RoomRepository } from '../../repositories/room';
import { NotFoundError } from '../../errors';

export class ChatService {
  static async sendMessage(data: {
    roomCode: string;
    userId: string;
    content: string;
  }) {
    const room = await RoomRepository.findByCode(data.roomCode);
    if (!room) throw new NotFoundError('Room not found');

    const message = await ChatMessageRepository.create({
      roomId: room.id,
      senderId: data.userId,
      content: data.content,
    });

    return message;
  }

  static async getHistory(roomCode: string) {
    const room = await RoomRepository.findByCode(roomCode);
    if (!room) throw new NotFoundError('Room not found');

    return ChatMessageRepository.findByRoomId(room.id);
  }
}
