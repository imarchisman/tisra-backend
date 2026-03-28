import { PrismaClient, Room } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateRoomInput, RoomWithParticipants } from '../../types/room.types';

export class RoomRepository {
  private static client: PrismaClient = prisma;

  static async create(data: CreateRoomInput & { code: string; hostId: string }): Promise<Room> {
    return this.client.room.create({
      data: {
        name: data.name,
        code: data.code,
        hostId: data.hostId,
        maxParticipants: data.maxParticipants ?? 10,
      },
    });
  }

  static async findById(id: string): Promise<Room | null> {
    return this.client.room.findUnique({ where: { id } });
  }

  static async findByCode(code: string): Promise<RoomWithParticipants | null> {
    return this.client.room.findUnique({
      where: { code },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    }) as Promise<RoomWithParticipants | null>;
  }

  static async update(id: string, data: Partial<Room>): Promise<Room> {
    return this.client.room.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<void> {
    await this.client.room.delete({ where: { id } });
  }

  static async deactivate(id: string): Promise<void> {
    await this.client.room.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
