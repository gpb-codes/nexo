export async function onRequestPut(context) {
  const { request, env } = context;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID requerido." }), { status: 400, headers: cors });
    }

    const user = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(id).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado." }), { status: 404, headers: cors });
    }

    const updates = [];
    const values = [];
    if (body.avatar) { updates.push("avatar = ?"); values.push(body.avatar); }
    if (body.accent) { updates.push("accent = ?"); values.push(body.accent); }
    if (body.displayName) { updates.push("display_name = ?"); values.push(body.displayName); }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "Sin cambios." }), { status: 200, headers: cors });
    }

    values.push(id);
    await env.DB.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();

    return new Response(JSON.stringify({ ok: true, message: "Preferencias actualizadas." }), { status: 200, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno: " + err.message }), { status: 500, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
