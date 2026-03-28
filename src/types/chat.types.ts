import { ChatMessage } from '@prisma/client';

export interface ChatMessageWithSender extends ChatMessage {
  sender: {
    username: string;
  };
}

export interface SendMessageInput {
  roomCode: string;
  userId: string;
  content: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessageWithSender[];
}
