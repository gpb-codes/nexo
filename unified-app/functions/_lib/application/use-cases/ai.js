import { DEFAULT_AI_BASE_URL, resolveAiBaseUrl, validateMessages } from "../../domain/entities/ai.js";
import { DomainError, UnauthorizedError } from "../../domain/errors.js";

export function makeAiUseCases(provider) {
  return {
    status(user) {
      const resolved = resolveAiBaseUrl(user.aiBaseUrl);
      return {
        configured: !!user.aiApiKey,
        model: user.aiModel || "gpt-4o-mini",
        provider: resolved.host || "api.openai.com",
        baseUrl: resolved.url || DEFAULT_AI_BASE_URL,
      };
    },

    async chat(user, input) {
      if (!user.aiApiKey) throw new UnauthorizedError("Configura una API key en Ajustes para usar el asistente.");
      const resolved = resolveAiBaseUrl(user.aiBaseUrl);
      if (resolved.error) throw new DomainError(resolved.error, 400);
      const checked = validateMessages(input.messages);
      if (checked.error) throw new DomainError(checked.error, 400);

      const content = await provider.chatCompletion({
        baseUrl: resolved.url,
        apiKey: user.aiApiKey,
        model: user.aiModel || "gpt-4o-mini",
        messages: checked.messages,
      });
      return { content, model: user.aiModel || "gpt-4o-mini", provider: resolved.host };
    },
  };
}
