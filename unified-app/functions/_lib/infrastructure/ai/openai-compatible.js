export async function chatCompletion({ baseUrl, apiKey, model, messages }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    const error = new Error(`Proveedor IA ${response.status}: ${detail}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    const error = new Error("El proveedor IA devolvió una respuesta vacía.");
    error.status = 502;
    throw error;
  }
  return content.trim();
}
