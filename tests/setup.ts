import { prisma } from '../src/config/database';

export const clearDatabase = async (): Promise<void> => {
  const tables = ['room_participants', 'playlist_tracks', 'playlists', 'chat_messages', 'rooms', 'users'];
  try {
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error clearing database:', error);
  }
};

beforeEach(async (): Promise<void> => {
  await clearDatabase();
});

afterAll(async (): Promise<void> => {
  await prisma.$disconnect();
});
