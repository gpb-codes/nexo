import { generateToken, hashToken } from "../security/session.js";

export class D1AuthRepository {
  async findByEmail(env, email) {
    return env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  }

  async createUser(env, data) {
    const id = "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO users (id, name, email, password, avatar, accent, theme, display_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, data.name, data.email, data.passwordHash, data.avatar || "lorelei", data.accent || "#8b5cf6", data.theme || "oscuro", data.displayName || data.name, now).run();
    return { id, name: data.name, email: data.email, avatar: data.avatar || "lorelei", accent: data.accent || "#8b5cf6", theme: data.theme || "oscuro", display_name: data.displayName || data.name, created_at: now };
  }

  async updateUser(env, id, patch) {
    const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
    if (!entries.length) return;
    const sets = entries.map(([key]) => `${key} = ?`).join(", ");
    await env.DB.prepare(`UPDATE users SET ${sets} WHERE id = ?`)
      .bind(...entries.map(([, value]) => value), id).run();
  }

  async upsertSiteSettings(env, userId, site) {
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO site_settings (user_id, site_name, tagline, description, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         site_name = excluded.site_name,
         tagline = excluded.tagline,
         description = excluded.description,
         updated_at = excluded.updated_at`
    ).bind(userId, site.name, site.tagline, site.description, now).run();
  }

  async findByTokenHash(env, tokenHash) {
    return env.DB.prepare(
      `SELECT s.user_id AS uid, s.expires_at AS expires_at, s.revoked_at AS revoked_at,
              u.id, u.name, u.email, u.avatar, u.accent, u.theme, u.display_name, u.created_at, u.last_login,
              u.ai_api_key, u.ai_model, u.ai_base_url,
              ss.site_name, ss.tagline, ss.description
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN site_settings ss ON ss.user_id = u.id
       WHERE s.token_hash = ?`
    ).bind(tokenHash).first();
  }

  async createSession(env, userId) {
    const token = generateToken();
    const tokenHash = await hashToken(token);
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const id = "s_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, userId, tokenHash, now.toISOString(), expires.toISOString()).run();
    return { token, expires };
  }

  async revokeSession(env, tokenHash) {
    await env.DB.prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?")
      .bind(new Date().toISOString(), tokenHash).run();
  }
}
