import type { ChatMessage, ChatResult } from "../entities/chat";

export interface AiRepository {
  status(): Promise<{ configured: boolean; model: string; provider: string }>;
  chat(messages: ChatMessage[]): Promise<ChatResult>;
}
