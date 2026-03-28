import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AuthHelper } from '../services/auth/helper';
import { UnauthorizedError } from '../errors';
import cookie from 'cookie';
import { SocketData } from '../types/socket.types';

export const socketAuthMiddleware = (
  socket: Socket<any, any, any, SocketData>,
  next: (err?: ExtendedError) => void
): void => {
  try {
    let token = '';

    // 1. Try to get token from handshake auth
    const authHeader = socket.handshake.auth?.token || socket.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Try to get token from cookies
    if (!token && socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.accessToken;
    }

    if (!token) {
      return next(new UnauthorizedError('No authentication token provided'));
    }

    const payload = AuthHelper.verifyAccessToken(token);

    // Attach user to socket data using standard socket.data
    socket.data.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};
