import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { Server } from 'socket.io';
import { app } from '../src/app';
import { initializeSocketIO } from '../src/sockets';
import request from 'supertest';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../src/types/socket.types';

describe('Socket.IO Integration', () => {
  let io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
  let httpServer: HttpServer;
  let port: number;
  let hostToken: string;
  let joinerToken: string;
  let roomCode: string;

  const hostUser = {
    email: 'sock-host@example.com',
    username: 'sockhost',
    password: 'Password123!',
    displayName: 'Socket Host',
  };

  const joinerUser = {
    email: 'sock-joiner@example.com',
    username: 'sockjoiner',
    password: 'Password123!',
    displayName: 'Socket Joiner',
  };

  const waitForEvent = (socket: ClientSocket, event: string): Promise<unknown> => {
    return new Promise(
      (resolve: (value: unknown) => void, reject: (reason?: unknown) => void): void => {
        socket.once(event, resolve);
        socket.once('error', (err: Error): void => reject(new Error(err.message)));
        setTimeout((): void => reject(new Error(`Timeout waiting for event: ${event}`)), 5000);
      }
    );
  };

  beforeAll(async (): Promise<void> => {
    httpServer = createServer(app);
    io = initializeSocketIO(httpServer);

    await new Promise<void>((resolve: () => void): void => {
      httpServer.listen((): void => {
        const address = httpServer.address() as AddressInfo;
        port = address.port;
        resolve();
      });
    });
  });

  afterAll(async (): Promise<void> => {
    io.close();
    await new Promise<void>((resolve: () => void): void => {
      httpServer.close((): void => resolve());
    });
  });

  beforeEach(async (): Promise<void> => {
    const hostRes = await request(app).post('/api/v1/auth/register').send(hostUser);
    hostToken = hostRes.body.data.tokens.accessToken;

    const joinerRes = await request(app).post('/api/v1/auth/register').send(joinerUser);
    joinerToken = joinerRes.body.data.tokens.accessToken;

    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ name: 'Socket Room' });
    roomCode = roomRes.body.data.code;
  });

  it('should allow authenticated user to connect and join room', async (): Promise<void> => {
    const clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${hostToken}` },
      transports: ['websocket'],
    });

    await waitForEvent(clientSocket, 'connect');
    clientSocket.emit('room:join', { roomCode });

    const state = await waitForEvent(clientSocket, 'room:state');
    expect(state).toHaveProperty('isPlaying');

    clientSocket.disconnect();
  });

  it('should broadcast user-joined event to others', async (): Promise<void> => {
    const hostSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${hostToken}` },
      transports: ['websocket'],
    });

    const joinerSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${joinerToken}` },
      transports: ['websocket'],
    });

    await Promise.all([waitForEvent(hostSocket, 'connect'), waitForEvent(joinerSocket, 'connect')]);

    hostSocket.emit('room:join', { roomCode });
    await waitForEvent(hostSocket, 'room:state');

    const joinPromise = waitForEvent(hostSocket, 'room:user-joined');
    joinerSocket.emit('room:join', { roomCode });

    const joinData = (await joinPromise) as { username: string };
    expect(joinData.username).toBe(joinerUser.username);

    hostSocket.disconnect();
    joinerSocket.disconnect();
  });

  it('should broadcast chat messages', async (): Promise<void> => {
    const socket1 = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${hostToken}` },
      transports: ['websocket'],
    });

    const socket2 = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${joinerToken}` },
      transports: ['websocket'],
    });

    await Promise.all([waitForEvent(socket1, 'connect'), waitForEvent(socket2, 'connect')]);

    socket1.emit('room:join', { roomCode });
    socket2.emit('room:join', { roomCode });

    await Promise.all([waitForEvent(socket1, 'room:state'), waitForEvent(socket2, 'room:state')]);

    const content = 'Hello Room!';
    const messagePromise = waitForEvent(socket1, 'chat:message');

    socket2.emit('chat:message', { roomCode, content });

    const msg = (await messagePromise) as { content: string; username: string };
    expect(msg.content).toBe(content);
    expect(msg.username).toBe(joinerUser.username);

    socket1.disconnect();
    socket2.disconnect();
  });

  it('should allow host to control playback and broadcast updates', async (): Promise<void> => {
    const hostSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${hostToken}` },
      transports: ['websocket'],
    });

    const joinerSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${joinerToken}` },
      transports: ['websocket'],
    });

    await Promise.all([waitForEvent(hostSocket, 'connect'), waitForEvent(joinerSocket, 'connect')]);

    hostSocket.emit('room:join', { roomCode });
    joinerSocket.emit('room:join', { roomCode });

    await Promise.all([
      waitForEvent(hostSocket, 'room:state'),
      waitForEvent(joinerSocket, 'room:state'),
    ]);

    const updatePromise = waitForEvent(joinerSocket, 'playback:update');

    hostSocket.emit('playback:action', {
      roomCode,
      action: 'play',
      trackId: 'track-123',
      positionMs: 1000,
    });

    const update = (await updatePromise) as {
      isPlaying: boolean;
      currentTrackId: string;
      positionMs: number;
    };
    expect(update.isPlaying).toBe(true);
    expect(update.currentTrackId).toBe('track-123');
    expect(update.positionMs).toBe(1000);

    hostSocket.disconnect();
    joinerSocket.disconnect();
  });

  it('should forbid non-host from controlling playback', async (): Promise<void> => {
    const joinerSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${joinerToken}` },
      transports: ['websocket'],
    });

    await waitForEvent(joinerSocket, 'connect');
    joinerSocket.emit('room:join', { roomCode });
    await waitForEvent(joinerSocket, 'room:state');

    const errorData = await new Promise<{ message: string }>(
      (resolve: (value: { message: string }) => void, reject: (reason?: unknown) => void): void => {
        const timeout = setTimeout(
          (): void => reject(new Error('Timeout waiting for app:error')),
          3000
        );
        joinerSocket.once('app:error', (data: { message: string }): void => {
          clearTimeout(timeout);
          resolve(data);
        });
        joinerSocket.emit('playback:action', {
          roomCode,
          action: 'play',
        });
      }
    );

    expect(errorData.message.toLowerCase()).toContain('host');
    joinerSocket.disconnect();
  });
});
