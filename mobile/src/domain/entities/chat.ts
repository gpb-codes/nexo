export type ChatRole = "user" | "assistant" | "system";
export type ChatMessage = { role: ChatRole; content: string };
export type ChatResult = { content: string; model: string; provider: string };
