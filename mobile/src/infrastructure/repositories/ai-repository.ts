import type { ChatMessage, ChatResult } from "../../domain/entities/chat";
import type { AiRepository } from "../../domain/repositories/ai-repository";
import { api } from "../api/client";
import { endpoints as allEndpoints } from "../api/endpoints";

export class ApiAiRepository implements AiRepository {
  status() {
    return api<{ ok: boolean; configured: boolean; model: string; provider: string }>(allEndpoints.aiStatus);
  }

  async chat(messages: ChatMessage[]): Promise<ChatResult> {
    const data = await api<{ ok: boolean; content: string; model: string; provider: string }>(
      allEndpoints.aiChat,
      { method: "POST", body: JSON.stringify({ messages }) },
    );
    return { content: data.content, model: data.model, provider: data.provider };
  }
}
