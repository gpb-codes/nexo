import { getSessionUser } from "../_lib/auth.js";

const jsonHeaders = (extra = {}) => ({ "Content-Type": "application/json", ...extra });
const ALLOWED_STATUS = new Set(["activo", "pausado", "completado", "archivado"]);
const ALLOWED_PRIORITY = new Set(["alta", "media", "baja"]);

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    const { results } = await env.DB.prepare(
      "SELECT id, name, description, status, priority, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(user.id).all();
    return new Response(JSON.stringify({ ok: true, projects: results || [] }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const name = String(body.name || "").trim();
    if (!name || name.length > 120) return new Response(JSON.stringify({ error: "Nombre inválido (1-120 caracteres)." }), { status: 400, headers: jsonHeaders() });
    const description = String(body.description || "").slice(0, 1000);
    const priority = ALLOWED_PRIORITY.has(body.priority) ? body.priority : "media";
    const id = "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO projects (id, user_id, name, description, status, priority, created_at) VALUES (?, ?, ?, ?, 'activo', ?, ?)"
    ).bind(id, user.id, name, description, priority, now).run();
    return new Response(JSON.stringify({ ok: true, project: { id, name, description, status: "activo", priority, created_at: now } }), { status: 201, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const id = String(body.id || "").trim();
    if (!id) return new Response(JSON.stringify({ error: "id requerido." }), { status: 400, headers: jsonHeaders() });

    const updates = [];
    const values = [];
    if (body.name !== undefined) {
      const v = String(body.name).trim();
      if (!v || v.length > 120) return new Response(JSON.stringify({ error: "Nombre inválido." }), { status: 400, headers: jsonHeaders() });
      updates.push("name = ?"); values.push(v);
    }
    if (body.description !== undefined) { updates.push("description = ?"); values.push(String(body.description).slice(0, 1000)); }
    if (body.status !== undefined) {
      const v = String(body.status);
      if (!ALLOWED_STATUS.has(v)) return new Response(JSON.stringify({ error: "Estado inválido." }), { status: 400, headers: jsonHeaders() });
      updates.push("status = ?"); values.push(v);
    }
    if (body.priority !== undefined) {
      const v = String(body.priority);
      if (!ALLOWED_PRIORITY.has(v)) return new Response(JSON.stringify({ error: "Prioridad inválida." }), { status: 400, headers: jsonHeaders() });
      updates.push("priority = ?"); values.push(v);
    }
    if (!updates.length) return new Response(JSON.stringify({ ok: true, message: "Sin cambios." }), { status: 200, headers: jsonHeaders() });
    updates.push("updated_at = ?"); values.push(new Date().toISOString());
    values.push(id, user.id);
    const result = await env.DB.prepare(`UPDATE projects SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`).bind(...values).run();
    if (!result || result.meta?.changes === 0) return new Response(JSON.stringify({ error: "Proyecto no encontrado." }), { status: 404, headers: jsonHeaders() });
    return new Response(JSON.stringify({ ok: true, message: "Proyecto actualizado." }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const id = String(body.id || "").trim();
    if (!id) return new Response(JSON.stringify({ error: "id requerido." }), { status: 400, headers: jsonHeaders() });
    const result = await env.DB.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, user.id).run();
    if (!result || result.meta?.changes === 0) return new Response(JSON.stringify({ error: "Proyecto no encontrado." }), { status: 404, headers: jsonHeaders() });
    return new Response(JSON.stringify({ ok: true, message: "Proyecto eliminado." }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
