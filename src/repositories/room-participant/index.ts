import { PrismaClient, RoomParticipant } from '@prisma/client';
import { prisma } from '../../config/database';

export class RoomParticipantRepository {
  private static client: PrismaClient = prisma;

  static async add(roomId: string, userId: string): Promise<RoomParticipant> {
    return this.client.roomParticipant.create({
      data: { roomId, userId },
    });
  }

  static async remove(roomId: string, userId: string): Promise<void> {
    await this.client.roomParticipant.delete({
      where: {
        roomId_userId: { roomId, userId },
      },
    });
  }

  static async findByRoomAndUser(roomId: string, userId: string): Promise<RoomParticipant | null> {
    return this.client.roomParticipant.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    });
  }

  static async getParticipantCount(roomId: string): Promise<number> {
    return this.client.roomParticipant.count({
      where: { roomId },
    });
  }
}
