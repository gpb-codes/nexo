export class D1ProjectRepository {
  async list(env, userId) {
    const { results } = await env.DB.prepare(
      "SELECT id, name, description, status, priority, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(userId).all();
    return results || [];
  }
  async create(env, userId, data) {
    const id = "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO projects (id, user_id, name, description, status, priority, created_at) VALUES (?, ?, ?, ?, 'activo', ?, ?)"
    ).bind(id, userId, data.name, data.description || "", data.priority, now).run();
    return { id, name: data.name, status: "activo", created_at: now };
  }
  async update(env, userId, id, patch) {
    const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
    if (!entries.length) return false;
    const sets = entries.map(([key]) => `${key} = ?`).join(", ");
    const result = await env.DB.prepare(`UPDATE projects SET ${sets} WHERE id = ? AND user_id = ?`)
      .bind(...entries.map(([, value]) => value), id, userId).run();
    return !!result?.meta?.changes;
  }
  async delete(env, userId, id) {
    const result = await env.DB.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
    return !!result?.meta?.changes;
  }
}
