import { serializeNote } from "../../domain/entities.js";

export class D1NoteRepository {
  async list(env, userId) {
    const { results } = await env.DB.prepare(
      `SELECT id, kind, title, content, contact_name, contact_phone, contact_email, contact_org,
              source, created_at, updated_at,
              CASE WHEN image_data IS NOT NULL AND length(image_data) > 0 THEN 1 ELSE 0 END AS has_image
       FROM notes WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(userId).all();
    return (results || []).map(serializeNote);
  }

  async find(env, userId, id) {
    return env.DB.prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?").bind(id, userId).first();
  }

  async create(env, userId, data) {
    const id = "n_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO notes
        (id, user_id, kind, title, content, contact_name, contact_phone, contact_email, contact_org, image_data, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, userId, data.kind, data.title, data.content,
      data.contact?.name || "", data.contact?.phone || "", data.contact?.email || "", data.contact?.org || "",
      data.image || null, data.source, now,
    ).run();
    return { id, kind: data.kind, title: data.title, source: data.source, createdAt: now };
  }

  async delete(env, userId, id) {
    const result = await env.DB.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").bind(id, userId).run();
    return !!result?.meta?.changes;
  }
}
