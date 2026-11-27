export async function onRequestPost(context) {
  const { request, env } = context;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Correo y contraseña requeridos." }), { status: 400, headers: cors });
    }

    const user = await env.DB.prepare(
      "SELECT id, name, email, password, avatar, accent, display_name, created_at FROM users WHERE email = ?"
    ).bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Correo o contraseña incorrectos." }), { status: 401, headers: cors });
    }

    // Hash password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashed = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (hashed !== user.password) {
      return new Response(JSON.stringify({ error: "Correo o contraseña incorrectos." }), { status: 401, headers: cors });
    }

    // Update last login
    await env.DB.prepare("UPDATE users SET last_login = ? WHERE id = ?").bind(new Date().toISOString(), user.id).run();

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      accent: user.accent,
      displayName: user.display_name || user.name,
      createdAt: user.created_at,
    };

    return new Response(JSON.stringify({ ok: true, user: safeUser }), { status: 200, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno: " + err.message }), { status: 500, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
