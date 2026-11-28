import {
  serializeActivity,
  serializeDocument,
  serializeDocumentVersion,
  serializeMember,
} from "../../domain/entities.js";

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export class D1CollaborationRepository {
  async roleForProject(env, projectId, userId) {
    const row = await env.DB.prepare(
      `SELECT COALESCE(pm.role, CASE WHEN p.user_id = ? THEN 'owner' ELSE NULL END) AS role
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
       WHERE p.id = ?`
    ).bind(userId, userId, projectId).first();
    return row?.role || null;
  }

  async findProject(env, userId, projectId) {
    return env.DB.prepare(
      `SELECT p.*,
              COALESCE(pm.role, CASE WHEN p.user_id = ? THEN 'owner' ELSE NULL END) AS role,
              (SELECT COUNT(*) FROM project_members m WHERE m.project_id = p.id) AS member_count,
              (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
              (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completada') AS completed_task_count
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
       WHERE p.id = ? AND (p.user_id = ? OR pm.user_id IS NOT NULL)`
    ).bind(userId, userId, projectId, userId).first();
  }

  async listMembers(env, projectId) {
    const { results } = await env.DB.prepare(
      `SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.invited_by, pm.created_at,
              u.name, u.display_name, u.email, u.avatar
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ?
       ORDER BY CASE pm.role WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, pm.created_at ASC`
    ).bind(projectId).all();
    return (results || []).map(serializeMember);
  }

  async findUserByEmail(env, email) {
    return env.DB.prepare(
      "SELECT id, name, display_name, email, avatar FROM users WHERE email = ?"
    ).bind(email).first();
  }

  async upsertMember(env, projectId, userId, role, invitedBy) {
    const now = new Date().toISOString();
    const memberId = id("pm");
    await env.DB.prepare(
      `INSERT INTO project_members (id, project_id, user_id, role, invited_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(project_id, user_id) DO UPDATE SET role = excluded.role`
    ).bind(memberId, projectId, userId, role, invitedBy, now).run();
    const row = await env.DB.prepare(
      `SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.invited_by, pm.created_at,
              u.name, u.display_name, u.email, u.avatar
       FROM project_members pm JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ? AND pm.user_id = ?`
    ).bind(projectId, userId).first();
    return row ? serializeMember(row) : null;
  }

  async removeMember(env, projectId, userId) {
    const result = await env.DB.prepare(
      "DELETE FROM project_members WHERE project_id = ? AND user_id = ? AND role <> 'owner'"
    ).bind(projectId, userId).run();
    return !!result?.meta?.changes;
  }

  async logActivity(env, { actorId, action, entityType, entityId, projectId, detail }) {
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO activity_log
        (id, actor_id, actor_name, action, entity_type, entity_id, project_id, detail, created_at)
       VALUES (?, ?, (SELECT COALESCE(display_name, name) FROM users WHERE id = ?), ?, ?, ?, ?, ?, ?)`
    ).bind(
      id("a"),
      actorId,
      actorId,
      action,
      entityType,
      entityId || null,
      projectId || null,
      detail ? JSON.stringify(detail) : null,
      now,
    ).run();
  }

  async listActivity(env, { projectId, entityType, entityId, limit = 50 }) {
    const clauses = [];
    const values = [];
    if (projectId) {
      clauses.push("project_id = ?");
      values.push(projectId);
    }
    if (entityType) {
      clauses.push("entity_type = ?");
      values.push(entityType);
    }
    if (entityId) {
      clauses.push("entity_id = ?");
      values.push(entityId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
    const { results } = await env.DB.prepare(
      `SELECT * FROM activity_log ${where} ORDER BY created_at DESC LIMIT ${safeLimit}`
    ).bind(...values).all();
    return (results || []).map(serializeActivity);
  }

  async listDocuments(env, userId, projectId = null) {
    if (projectId) {
      const { results } = await env.DB.prepare(
        `SELECT d.*, p.name AS project_name,
                COALESCE(pm.role, CASE WHEN d.owner_id = ? THEN 'owner' ELSE NULL END) AS role
         FROM documents d
         JOIN projects p ON p.id = d.project_id
         LEFT JOIN project_members pm ON pm.project_id = d.project_id AND pm.user_id = ?
         WHERE d.project_id = ? AND (d.owner_id = ? OR pm.user_id IS NOT NULL)
         ORDER BY COALESCE(d.updated_at, d.created_at) DESC`
      ).bind(userId, userId, projectId, userId).all();
      return (results || []).map((row) => serializeDocument(row));
    }
    const { results } = await env.DB.prepare(
      `SELECT d.*, p.name AS project_name,
              COALESCE(pm.role, CASE WHEN d.owner_id = ? THEN 'owner' ELSE NULL END) AS role
       FROM documents d
       LEFT JOIN projects p ON p.id = d.project_id
       LEFT JOIN project_members pm ON pm.project_id = d.project_id AND pm.user_id = ?
       WHERE d.owner_id = ? OR pm.user_id IS NOT NULL
       ORDER BY COALESCE(d.updated_at, d.created_at) DESC`
    ).bind(userId, userId, userId).all();
    return (results || []).map((row) => serializeDocument(row));
  }

  async findDocument(env, userId, documentId) {
    return env.DB.prepare(
      `SELECT d.*, p.name AS project_name,
              COALESCE(pm.role, CASE WHEN d.owner_id = ? THEN 'owner' ELSE NULL END) AS role
       FROM documents d
       LEFT JOIN projects p ON p.id = d.project_id
       LEFT JOIN project_members pm ON pm.project_id = d.project_id AND pm.user_id = ?
       WHERE d.id = ? AND (d.owner_id = ? OR pm.user_id IS NOT NULL)`
    ).bind(userId, userId, documentId, userId).first();
  }

  async createDocument(env, userId, data) {
    const now = new Date().toISOString();
    const documentId = id("d");
    await env.DB.prepare(
      `INSERT INTO documents (id, project_id, owner_id, title, content, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(documentId, data.projectId || null, userId, data.title, data.content || "", data.status || "activo", now).run();
    await env.DB.prepare(
      `INSERT INTO document_versions (id, document_id, editor_id, title, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id("dv"), documentId, userId, data.title, data.content || "", now).run();
    return { id: documentId, title: data.title, project_id: data.projectId || null, status: data.status || "activo", created_at: now };
  }

  async updateDocument(env, userId, documentId, data) {
    const current = await this.findDocument(env, userId, documentId);
    if (!current) return null;
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO document_versions (id, document_id, editor_id, title, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id("dv"), documentId, userId, current.title, current.content || "", now).run();
    const next = {
      title: data.title ?? current.title,
      content: data.content ?? current.content ?? "",
      status: data.status ?? current.status ?? "activo",
      project_id: data.projectId === undefined ? current.project_id : data.projectId,
    };
    await env.DB.prepare(
      `UPDATE documents SET title = ?, content = ?, status = ?, project_id = ?, updated_at = ? WHERE id = ?`
    ).bind(next.title, next.content, next.status, next.project_id || null, now, documentId).run();
    return { ...current, ...next, updated_at: now };
  }

  async deleteDocument(env, userId, documentId) {
    const current = await this.findDocument(env, userId, documentId);
    if (!current) return null;
    if (current.owner_id !== userId && current.role !== "owner") return null;
    const result = await env.DB.prepare("DELETE FROM documents WHERE id = ?").bind(documentId).run();
    return result?.meta?.changes ? current : null;
  }

  async listVersions(env, documentId) {
    const { results } = await env.DB.prepare(
      `SELECT dv.*, COALESCE(u.display_name, u.name) AS editor_name
       FROM document_versions dv
       LEFT JOIN users u ON u.id = dv.editor_id
       WHERE dv.document_id = ?
       ORDER BY dv.created_at DESC`
    ).bind(documentId).all();
    return (results || []).map(serializeDocumentVersion);
  }
}
