import request from 'supertest';
import { app } from '../src/app';

describe('Authentication Module', () => {
  const testUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Password123!',
    displayName: 'Test User',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.header['set-cookie']).toBeDefined();
    });

    it('should fail if email already exists', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({ email: 'invalid' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login successfully and set cookies', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.header['set-cookie']).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token using cookie', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const cookies = loginRes.header['set-cookie'] as unknown as string[];
      const refreshTokenCookie = cookies
        .find((c: string) => c.startsWith('refreshToken'))
        ?.split(';')[0];

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [refreshTokenCookie || '']);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear cookies on logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(200);
      expect(res.header['set-cookie']).toBeDefined();

      const cookies = res.header['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
    });
  });
});
