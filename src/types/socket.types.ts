export interface RoomJoinPayload {
  roomCode: string;
}

export interface ChatMessagePayload {
  roomCode: string;
  content: string;
}

export interface PlaybackActionPayload {
  roomCode: string;
  action: 'play' | 'pause' | 'seek' | 'skip';
  trackId?: string;
  positionMs?: number;
}

export interface RoomStateUpdate {
  isPlaying: boolean;
  currentTrackId: string | null;
  positionMs: number;
  updatedAt: number;
}

export interface ServerToClientEvents {
  'room:user-joined': (data: { userId: string; username: string }) => void;
  'room:user-left': (data: { userId: string }) => void;
  'room:state': (state: RoomStateUpdate) => void;
  'chat:message': (message: {
    id: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
  }) => void;
  'playback:update': (state: RoomStateUpdate) => void;
  'app:error': (error: { message: string; code?: string }) => void;
  error: (error: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  'room:join': (payload: RoomJoinPayload) => void;
  'room:leave': (payload: RoomJoinPayload) => void;
  'chat:message': (payload: ChatMessagePayload) => void;
  'playback:action': (payload: PlaybackActionPayload) => void;
}

export interface SocketData {
  user: {
    id: string;
    email: string;
    username: string;
  };
}
