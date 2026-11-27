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
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (name.length < 2) {
      return new Response(JSON.stringify({ error: "El nombre debe tener al menos 2 caracteres." }), { status: 400, headers: cors });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Correo inválido." }), { status: 400, headers: cors });
    }
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 8 caracteres." }), { status: 400, headers: cors });
    }

    // Check if email exists
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "Este correo ya está registrado." }), { status: 409, headers: cors });
    }

    // Hash password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashed = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const id = "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO users (id, name, email, password, avatar, accent, display_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, name, email, hashed, "lorelei", "#8b5cf6", name, now).run();

    const user = { id, name, email, avatar: "lorelei", accent: "#8b5cf6", displayName: name, createdAt: now };
    return new Response(JSON.stringify({ ok: true, user }), { status: 201, headers: cors });
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
