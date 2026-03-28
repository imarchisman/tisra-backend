import request from 'supertest';
import { app } from '../src/app';

describe('Room Module', () => {
  const hostUser = {
    email: 'host@example.com',
    username: 'hostuser',
    password: 'Password123!',
    displayName: 'Host User',
  };

  const joinerUser = {
    email: 'joiner@example.com',
    username: 'joineruser',
    password: 'Password123!',
    displayName: 'Joiner User',
  };

  let hostToken: string;
  let joinerToken: string;

  beforeEach(async (): Promise<void> => {
    const hostRes = await request(app).post('/api/v1/auth/register').send(hostUser);
    expect(hostRes.status).toBe(201);
    hostToken = hostRes.body.data.tokens.accessToken;

    const joinerRes = await request(app).post('/api/v1/auth/register').send(joinerUser);
    expect(joinerRes.status).toBe(201);
    joinerToken = joinerRes.body.data.tokens.accessToken;
  });

  describe('Room Lifecycle', () => {
    it('should create a room and join with code', async () => {
      // 1. Create Room (Host)
      const createRes = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ name: 'Party Room' });

      expect(createRes.status).toBe(201);
      const roomCode = createRes.body.data.code;
      expect(roomCode).toHaveLength(6);

      // 2. Join Room (Joiner)
      const joinRes = await request(app)
        .post('/api/v1/rooms/join')
        .set('Authorization', `Bearer ${joinerToken}`)
        .send({ code: roomCode });

      expect(joinRes.status).toBe(200);
      expect(joinRes.body.data.participants).toHaveLength(2);
    });

    it('should allow host to close room', async () => {
      const createRes = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ name: 'Close Me' });

      const roomId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/rooms/${roomId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(deleteRes.status).toBe(200);
    });

    it('should forbid non-host from closing room', async () => {
      const createRes = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ name: 'Safe Room' });

      const roomId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/rooms/${roomId}`)
        .set('Authorization', `Bearer ${joinerToken}`);

      expect(deleteRes.status).toBe(403);
    });
  });
});
