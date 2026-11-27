import type { ChatMessage } from "../../domain/entities/chat";
import type { AiRepository } from "../../domain/repositories/ai-repository";

export function makeAiUseCases(repository: AiRepository) {
  return {
    status: () => repository.status(),
    chat: (messages: ChatMessage[]) => repository.chat(messages),
  };
}
