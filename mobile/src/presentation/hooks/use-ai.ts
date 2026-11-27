import { useMutation, useQuery } from "@tanstack/react-query";
import { container } from "../../application/container";
import type { ChatMessage } from "../../domain/entities/chat";

export function useAiStatus() {
  return useQuery({ queryKey: ["aiStatus"], queryFn: () => container.useCases.ai.status(), retry: false });
}

export function useAiChat() {
  return useMutation({ mutationFn: (messages: ChatMessage[]) => container.useCases.ai.chat(messages) });
}
