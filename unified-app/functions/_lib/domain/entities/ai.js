export const DEFAULT_AI_BASE_URL = "https://api.openai.com/v1";
export const ALLOWED_AI_HOSTS = new Set([
  "api.openai.com",
  "openrouter.ai",
  "api.groq.com",
  "api.mistral.ai",
]);

export function resolveAiBaseUrl(raw) {
  if (!raw) return { url: DEFAULT_AI_BASE_URL, host: "api.openai.com" };
  try {
    const url = new URL(String(raw));
    if (url.protocol !== "https:" || !ALLOWED_AI_HOSTS.has(url.hostname)) {
      return { error: "Endpoint de IA no permitido. Usa un proveedor compatible con OpenAI." };
    }
    return { url: url.toString().replace(/\/$/, ""), host: url.hostname };
  } catch {
    return { error: "Endpoint de IA inválido." };
  }
}

export function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    return { error: "Se requieren entre 1 y 20 mensajes." };
  }
  const roles = new Set(["user", "assistant", "system"]);
  const cleaned = messages.map((item) => {
    const role = String(item?.role || "");
    const content = String(item?.content || "").trim();
    if (!roles.has(role) || !content || content.length > 4000) return null;
    return { role, content };
  });
  if (cleaned.some((item) => !item)) return { error: "Mensaje inválido." };
  if (cleaned.reduce((sum, item) => sum + item.content.length, 0) > 12000) {
    return { error: "La conversación es demasiado larga." };
  }
  return { messages: cleaned };
}
