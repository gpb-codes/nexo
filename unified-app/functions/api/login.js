import { verifyPassword, hashPassword, createSession, buildSessionCookie, isSecureRequest } from "../_lib/auth.js";

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
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Correo y contraseña requeridos." }), { status: 400, headers: jsonHeaders() });
    }

    const user = await env.DB.prepare(
      `SELECT u.id, u.name, u.email, u.password, u.avatar, u.accent, u.theme, u.display_name, u.created_at,
              u.ai_api_key, u.ai_model, u.ai_base_url,
              ss.site_name, ss.tagline, ss.description
       FROM users u
       LEFT JOIN site_settings ss ON ss.user_id = u.id
       WHERE u.email = ?`
    ).bind(email).first();

    // Constant-ish response: do not reveal whether the account exists.
    if (!user) {
      return new Response(JSON.stringify({ error: "Correo o contraseña incorrectos." }), { status: 401, headers: jsonHeaders() });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Correo o contraseña incorrectos." }), { status: 401, headers: jsonHeaders() });
    }

    // Migrate legacy SHA-256 password to PBKDF2 on successful login.
    if (!String(user.password).startsWith("pbkdf2$")) {
      try {
        const newHash = await hashPassword(password);
        await env.DB.prepare("UPDATE users SET password = ? WHERE id = ?").bind(newHash, user.id).run();
      } catch (e) { /* non-fatal */ }
    }

    await env.DB.prepare("UPDATE users SET last_login = ? WHERE id = ?").bind(new Date().toISOString(), user.id).run();

    const session = await createSession(env, user.id);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      accent: user.accent,
      theme: user.theme || "oscuro",
      displayName: user.display_name || user.name,
      aiApiKey: user.ai_api_key || null,
      aiModel: user.ai_model || null,
      aiBaseUrl: user.ai_base_url || null,
      createdAt: user.created_at,
      site: {
        name: user.site_name || "Nexo",
        tagline: user.tagline || "Centro de operaciones",
        description: user.description || "Tu segundo cerebro unificado",
      },
    };

    return new Response(JSON.stringify({ ok: true, user: safeUser }), {
      status: 200,
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
