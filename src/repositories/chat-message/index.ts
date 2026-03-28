import { prisma } from '../../config/database';
import { ChatMessageWithSender } from '../../types/chat.types';

export class ChatMessageRepository {
  static async create(data: {
    roomId: string;
    senderId: string;
    content: string;
  }): Promise<ChatMessageWithSender> {
    return prisma.chatMessage.create({
      data,
      include: {
        sender: {
          select: {
            username: true,
          },
        },
      },
    }) as Promise<ChatMessageWithSender>;
  }

  static async findByRoomId(roomId: string, limit: number = 50): Promise<ChatMessageWithSender[]> {
    return prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            username: true,
          },
        },
      },
    }) as Promise<ChatMessageWithSender[]>;
  }
}
