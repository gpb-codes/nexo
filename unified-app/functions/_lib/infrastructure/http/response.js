import { DomainError } from "../../domain/errors.js";

export const jsonHeaders = (extra = {}) => ({ "Content-Type": "application/json", ...extra });

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders(extraHeaders) });
}

export function ok(data, status = 200) {
  return json({ ok: true, ...data }, status);
}

export function fail(error) {
  if (error instanceof DomainError) return json({ error: error.message }, error.status);
  return json({ error: "Error interno." }, 500);
}

export async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}

export function noContent() {
  return new Response(null, { status: 204 });
}
