import { hashPassword, createSession, buildSessionCookie, isSecureRequest } from "../_lib/auth.js";

const jsonHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...extra,
});

export async function onRequestPost(context) {
  const { request, env } = context;
  const secure = isSecureRequest(request);
  try {
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (name.length < 2 || name.length > 80) {
      return new Response(JSON.stringify({ error: "Nombre inválido (2-80 caracteres)." }), { status: 400, headers: jsonHeaders() });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "Correo inválido." }), { status: 400, headers: jsonHeaders() });
    }
    if (password.length < 8 || password.length > 128) {
      return new Response(JSON.stringify({ error: "La contraseña debe tener entre 8 y 128 caracteres." }), { status: 400, headers: jsonHeaders() });
    }

    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "No se pudo crear la cuenta. Verifica los datos." }), { status: 409, headers: jsonHeaders() });
    }

    const hashed = await hashPassword(password);
    const id = "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO users (id, name, email, password, avatar, accent, theme, display_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, name, email, hashed, "lorelei", "#8b5cf6", "oscuro", name, now).run();

    const site = { name: "Nexo", tagline: "Centro de operaciones", description: "Tu segundo cerebro unificado" };
    try {
      await env.DB.prepare(
        "INSERT INTO site_settings (user_id, site_name, tagline, description, updated_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, site.name, site.tagline, site.description, now).run();
    } catch (e) { /* defaults are returned even if the settings row cannot be created */ }

    const session = await createSession(env, id);
    const user = { id, name, email, avatar: "lorelei", accent: "#8b5cf6", theme: "oscuro", displayName: name, aiApiKey: null, aiModel: null, aiBaseUrl: null, createdAt: now, site };

    return new Response(JSON.stringify({ ok: true, user }), {
      status: 201,
      headers: {
        ...jsonHeaders(),
        "Set-Cookie": buildSessionCookie(session.token, session.expires, secure),
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
