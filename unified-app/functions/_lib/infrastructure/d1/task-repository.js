import { serializeTask } from "../../domain/entities.js";

const TASK_SELECT = `
  SELECT t.id, t.title, t.description, t.priority, t.status, t.due_date, t.category,
         t.project_id, t.assignee_id, t.tags, t.created_at, t.completed_at,
         p.name AS project_name,
         COALESCE(u.display_name, u.name) AS assignee_name
  FROM tasks t
  LEFT JOIN projects p ON p.id = t.project_id
  LEFT JOIN users u ON u.id = t.assignee_id
`;

export class D1TaskRepository {
  async list(env, userId) {
    const { results } = await env.DB.prepare(
      `${TASK_SELECT}
       WHERE t.user_id = ? OR t.project_id IN (
         SELECT project_id FROM project_members WHERE user_id = ?
       )
       ORDER BY CASE WHEN t.status = 'pendiente' THEN 0 ELSE 1 END,
                CASE WHEN t.priority = 'alta' THEN 0 WHEN t.priority = 'media' THEN 1 ELSE 2 END,
                t.due_date ASC NULLS LAST, t.created_at DESC`
    ).bind(userId, userId).all();
    return (results || []).map(serializeTask);
  }

  async find(env, userId, id) {
    const row = await env.DB.prepare(
      `${TASK_SELECT}
       WHERE t.id = ? AND (t.user_id = ? OR t.project_id IN (
         SELECT project_id FROM project_members WHERE user_id = ?
       ))`
    ).bind(id, userId, userId).first();
    return row ? serializeTask(row) : null;
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
      `INSERT INTO tasks
        (id, user_id, title, description, priority, status, due_date, category, client_id,
         project_id, assignee_id, tags, created_at)
       VALUES (?, ?, ?, ?, ?, 'pendiente', ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      userId,
      data.title,
      data.description || "",
      data.priority,
      data.dueDate || null,
      data.category || null,
      data.clientId || null,
      data.projectId || null,
      data.assigneeId || null,
      JSON.stringify(data.tags || []),
      now,
    ).run();
    return {
      id,
      title: data.title,
      status: "pendiente",
      created_at: now,
      project_id: data.projectId || null,
      tags: data.tags || [],
      client_id: data.clientId || null,
    };
  }

  async update(env, userId, id, patch) {
    const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
    if (!entries.length) return false;
    const sets = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([key, value]) => (key === "tags" ? JSON.stringify(value) : value));
    const result = await env.DB.prepare(
      `UPDATE tasks SET ${sets}
       WHERE id = ? AND (
         user_id = ? OR project_id IN (
           SELECT project_id FROM project_members
           WHERE user_id = ? AND role IN ('owner', 'editor')
         )
       )`
    ).bind(...values, id, userId, userId).run();
    return !!result?.meta?.changes;
  }

  async delete(env, userId, id) {
    const result = await env.DB.prepare(
      `DELETE FROM tasks
       WHERE id = ? AND (
         user_id = ? OR project_id IN (
           SELECT project_id FROM project_members
           WHERE user_id = ? AND role IN ('owner', 'editor')
         )
       )`
    ).bind(id, userId, userId).run();
    return !!result?.meta?.changes;
  }
}
