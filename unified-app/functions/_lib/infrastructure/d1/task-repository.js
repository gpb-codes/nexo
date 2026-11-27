export class D1TaskRepository {
  async list(env, userId) {
    const { results } = await env.DB.prepare(
      `SELECT id, title, description, priority, status, due_date, category, created_at, completed_at
       FROM tasks WHERE user_id = ?
       ORDER BY CASE WHEN status = 'pendiente' THEN 0 ELSE 1 END,
                CASE WHEN priority = 'alta' THEN 0 WHEN priority = 'media' THEN 1 ELSE 2 END,
                due_date ASC NULLS LAST, created_at DESC`
    ).bind(userId).all();
    return results || [];
  }

  async create(env, userId, data) {
    if (data.clientId) {
      const existing = await env.DB.prepare(
        "SELECT id, title, status, created_at FROM tasks WHERE user_id = ? AND client_id = ?"
      ).bind(userId, data.clientId).first();
      if (existing) return existing;
    }

    const id = "t_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO tasks (id, user_id, title, description, priority, status, due_date, category, client_id, created_at) VALUES (?, ?, ?, ?, ?, 'pendiente', ?, ?, ?, ?)"
    ).bind(id, userId, data.title, data.description || "", data.priority, data.dueDate || null, data.category || null, data.clientId || null, now).run();
    return { id, title: data.title, status: "pendiente", created_at: now, client_id: data.clientId || null };
  }

  async update(env, userId, id, patch) {
    const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
    if (!entries.length) return false;
    const sets = entries.map(([key]) => `${key} = ?`).join(", ");
    const result = await env.DB.prepare(`UPDATE tasks SET ${sets} WHERE id = ? AND user_id = ?`)
      .bind(...entries.map(([, value]) => value), id, userId).run();
    return !!result?.meta?.changes;
  }

  async delete(env, userId, id) {
    const result = await env.DB.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").bind(id, userId).run();
    return !!result?.meta?.changes;
  }
}
