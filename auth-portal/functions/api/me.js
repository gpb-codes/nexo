export async function onRequestGet(context) {
  const { request, env } = context;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "ID requerido." }), { status: 400, headers: cors });
    }

    const user = await env.DB.prepare(
      "SELECT id, name, email, avatar, accent, display_name, created_at, last_login FROM users WHERE id = ?"
    ).bind(id).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado." }), { status: 404, headers: cors });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      accent: user.accent,
      displayName: user.display_name || user.name,
      createdAt: user.created_at,
      lastLogin: user.last_login,
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
