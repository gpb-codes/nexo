import { getSessionUser } from "../_lib/auth.js";

const jsonHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...extra,
});

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) {
      return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    }
    return new Response(JSON.stringify({ ok: true, user }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
