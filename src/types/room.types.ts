import { Room, RoomParticipant, PlaybackState } from '@prisma/client';

export interface CreateRoomInput {
  name: string;
  maxParticipants?: number;
}

export interface JoinRoomInput {
  code: string;
}

export interface RoomParticipantDetails extends RoomParticipant {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface RoomWithParticipants extends Room {
  participants: RoomParticipantDetails[];
  host: {
    id: string;
    username: string;
    displayName: string;
  };
}

export interface RoomDetails {
  id: string;
  code: string;
  name: string;
  hostId: string;
  maxParticipants: number;
  isActive: boolean;
  currentTrackId: string | null;
  playbackState: PlaybackState;
  playbackPosition: number;
  participants: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
