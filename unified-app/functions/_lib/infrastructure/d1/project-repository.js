import { serializeProject } from "../../domain/entities.js";

const PROJECT_SELECT = `
  SELECT p.*,
         COALESCE(pm.role, CASE WHEN p.user_id = ? THEN 'owner' ELSE NULL END) AS role,
         (SELECT COUNT(*) FROM project_members m WHERE m.project_id = p.id) AS member_count,
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completada') AS completed_task_count
  FROM projects p
  LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
`;

export class D1ProjectRepository {
  async list(env, userId) {
    const { results } = await env.DB.prepare(
      `${PROJECT_SELECT}
       WHERE p.user_id = ? OR pm.user_id IS NOT NULL
       ORDER BY p.created_at DESC`
    ).bind(userId, userId, userId).all();
    return (results || []).map(serializeProject);
  }

  async find(env, userId, id) {
    const row = await env.DB.prepare(
      `${PROJECT_SELECT}
       WHERE p.id = ? AND (p.user_id = ? OR pm.user_id IS NOT NULL)`
    ).bind(userId, userId, id, userId).first();
    return row ? serializeProject(row) : null;
  }

  async create(env, userId, data) {
    const id = "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const memberId = "pm_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO projects
          (id, user_id, name, description, status, priority, due_date, color, created_at)
         VALUES (?, ?, ?, ?, 'activo', ?, ?, ?, ?)`
      ).bind(id, userId, data.name, data.description || "", data.priority, data.dueDate || null, data.color || "#8b5cf6", now),
      env.DB.prepare(
        `INSERT OR IGNORE INTO project_members (id, project_id, user_id, role, invited_by, created_at)
         VALUES (?, ?, ?, 'owner', ?, ?)`
      ).bind(memberId, id, userId, userId, now),
    ]);
    return {
      id,
      name: data.name,
      description: data.description || "",
      status: "activo",
      priority: data.priority,
      due_date: data.dueDate || null,
      color: data.color || "#8b5cf6",
      created_at: now,
      role: "owner",
      member_count: 1,
      task_count: 0,
      completed_task_count: 0,
    };
  }

  async update(env, userId, id, patch) {
    const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
    if (!entries.length) return false;
    const sets = entries.map(([key]) => `${key} = ?`).join(", ");
    const result = await env.DB.prepare(
      `UPDATE projects SET ${sets}
       WHERE id = ? AND (
         user_id = ? OR id IN (
           SELECT project_id FROM project_members
           WHERE user_id = ? AND role IN ('owner', 'editor')
         )
       )`
    ).bind(...entries.map(([, value]) => value), id, userId, userId).run();
    return !!result?.meta?.changes;
  }

  async delete(env, userId, id) {
    const allowed = await env.DB.prepare(
      `SELECT p.id FROM projects p
       WHERE p.id = ? AND (
         p.user_id = ? OR EXISTS (
           SELECT 1 FROM project_members pm
           WHERE pm.project_id = p.id AND pm.user_id = ? AND pm.role = 'owner'
         )
       )`
    ).bind(id, userId, userId).first();
    if (!allowed) return false;
    await env.DB.batch([
      env.DB.prepare("UPDATE tasks SET project_id = NULL, assignee_id = NULL WHERE project_id = ?").bind(id),
      env.DB.prepare("DELETE FROM document_versions WHERE document_id IN (SELECT id FROM documents WHERE project_id = ?)").bind(id),
      env.DB.prepare("DELETE FROM documents WHERE project_id = ?").bind(id),
      env.DB.prepare("DELETE FROM activity_log WHERE project_id = ?").bind(id),
      env.DB.prepare("DELETE FROM project_members WHERE project_id = ?").bind(id),
      env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id),
    ]);
    return true;
  }
}
