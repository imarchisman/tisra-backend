import { prisma } from '../../config/database';
import { ChatMessage } from '@prisma/client';

export class ChatMessageRepository {
  static async create(data: {
    roomId: string;
    senderId: string;
    content: string;
  }): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data,
      include: {
        sender: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  static async findByRoomId(roomId: string, limit: number = 50): Promise<any[]> {
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
    });
  }
}
