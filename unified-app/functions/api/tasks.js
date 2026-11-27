import { getSessionUser } from "../_lib/auth.js";

const jsonHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...extra,
});

const ALLOWED_PRIORITY = new Set(["alta", "media", "baja"]);
const ALLOWED_STATUS = new Set(["pendiente", "completada"]);

function text(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function validateDueDate(value) {
  if (value === undefined || value === null) return { value: null };
  const v = text(value, 10);
  if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return { error: "Formato de fecha inválido (YYYY-MM-DD)." };
  }
  if (v && Number.isNaN(Date.parse(v))) {
    return { error: "Formato de fecha inválido (YYYY-MM-DD)." };
  }
  return { value: v || null };
}

function validateCategory(value, current = "") {
  if (value === undefined) return { value: current };
  if (value === null) return { value: "" };
  const v = text(value, 80);
  return { value: v || "" };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) {
      return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    }
    const { results } = await env.DB.prepare(
      "SELECT id, title, description, priority, status, due_date, category, created_at, completed_at FROM tasks WHERE user_id = ? ORDER BY CASE WHEN status = 'pendiente' THEN 0 ELSE 1 END, CASE WHEN priority = 'alta' THEN 0 WHEN priority = 'media' THEN 1 ELSE 2 END, due_date ASC NULLS LAST, created_at DESC"
    ).bind(user.id).all();
    return new Response(JSON.stringify({ ok: true, tasks: results || [] }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) {
      return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    }
    let body;
    try { body = await request.json(); } catch { body = {}; }

    const title = text(body.title, 200);
    if (!title) {
      return new Response(JSON.stringify({ error: "Título inválido (1-200 caracteres)." }), { status: 400, headers: jsonHeaders() });
    }

    const description = String(body.description || "").slice(0, 2000);
    const priority = ALLOWED_PRIORITY.has(body.priority) ? body.priority : "media";

    const dueDate = validateDueDate(body.dueDate ?? body.due_date);
    if (dueDate.error) return new Response(JSON.stringify({ error: dueDate.error }), { status: 400, headers: jsonHeaders() });

    const category = validateCategory(body.category ?? body.category);
    if (category.error) return new Response(JSON.stringify({ error: category.error }), { status: 400, headers: jsonHeaders() });

    const id = "t_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO tasks (id, user_id, title, description, priority, status, due_date, category, created_at) VALUES (?, ?, ?, ?, ?, 'pendiente', ?, ?, ?)"
    ).bind(id, user.id, title, description, priority, dueDate.value, category.value || null, now).run();

    return new Response(JSON.stringify({
      ok: true,
      task: {
        id,
        title,
        description,
        priority,
        status: "pendiente",
        due_date: dueDate.value,
        category: category.value || "",
        created_at: now
      }
    }), { status: 201, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) {
      return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    }
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const id = String(body.id || "").trim();
    if (!id) {
      return new Response(JSON.stringify({ error: "id requerido." }), { status: 400, headers: jsonHeaders() });
    }

    const updates = [];
    const values = [];
    if (body.status !== undefined) {
      const s = String(body.status);
      if (!ALLOWED_STATUS.has(s)) {
        return new Response(JSON.stringify({ error: "Estado inválido." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("status = ?");
      values.push(s);
      if (s === "completada") {
        updates.push("completed_at = ?");
        values.push(new Date().toISOString());
      } else {
        updates.push("completed_at = ?");
        values.push(null);
      }
    }
    if (body.title !== undefined) {
      const t = text(body.title, 200);
      if (!t) return new Response(JSON.stringify({ error: "Título inválido." }), { status: 400, headers: jsonHeaders() });
      updates.push("title = ?"); values.push(t);
    }
    if (body.priority !== undefined) {
      const p = String(body.priority);
      if (!ALLOWED_PRIORITY.has(p)) {
        return new Response(JSON.stringify({ error: "Prioridad inválida." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("priority = ?"); values.push(p);
    }
    if (body.description !== undefined) {
      updates.push("description = ?"); values.push(String(body.description).slice(0, 2000));
    }
    if (body.dueDate !== undefined || body.due_date !== undefined) {
      const due = validateDueDate(body.dueDate ?? body.due_date);
      if (due.error) return new Response(JSON.stringify({ error: due.error }), { status: 400, headers: jsonHeaders() });
      updates.push("due_date = ?"); values.push(due.value);
    }
    if (body.category !== undefined) {
      const cat = validateCategory(body.category);
      if (cat.error) return new Response(JSON.stringify({ error: cat.error }), { status: 400, headers: jsonHeaders() });
      updates.push("category = ?"); values.push(cat.value || null);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "Sin cambios." }), { status: 200, headers: jsonHeaders() });
    }

    values.push(id, user.id);
    const result = await env.DB.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`).bind(...values).run();
    if (!result || result.meta?.changes === 0) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada." }), { status: 404, headers: jsonHeaders() });
    }
    return new Response(JSON.stringify({ ok: true, message: "Tarea actualizada." }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) {
      return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });
    }
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const id = String(body.id || "").trim();
    if (!id) {
      return new Response(JSON.stringify({ error: "id requerido." }), { status: 400, headers: jsonHeaders() });
    }
    const result = await env.DB.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").bind(id, user.id).run();
    if (!result || result.meta?.changes === 0) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada." }), { status: 404, headers: jsonHeaders() });
    }
    return new Response(JSON.stringify({ ok: true, message: "Tarea eliminada." }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
