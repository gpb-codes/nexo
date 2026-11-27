export class D1PreferencesRepository {
  async get(env, userId) {
    const row = await env.DB.prepare("SELECT * FROM site_settings WHERE user_id = ?").bind(userId).first();
    return {
      name: row?.site_name || "Nexo",
      tagline: row?.tagline || "Centro de operaciones",
      description: row?.description || "Tu segundo cerebro unificado",
    };
  }

  async update(env, userId, patch) {
    const userColumns = new Set(["avatar", "accent", "theme", "display_name", "ai_api_key", "ai_model", "ai_base_url"]);
    const entries = Object.entries(patch).filter(([key, value]) => userColumns.has(key) && value !== undefined);
    if (entries.length) {
      const sets = entries.map(([key]) => `${key} = ?`).join(", ");
      await env.DB.prepare(`UPDATE users SET ${sets} WHERE id = ?`)
        .bind(...entries.map(([, value]) => value), userId).run();
    }

    const site = ["siteName", "siteTagline", "siteDescription"].some((key) => patch[key] !== undefined);
    if (site) {
      const current = await this.get(env, userId);
      const next = {
        name: patch.siteName ?? current.name,
        tagline: patch.siteTagline ?? current.tagline,
        description: patch.siteDescription ?? current.description,
      };
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO site_settings (user_id, site_name, tagline, description, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           site_name = excluded.site_name,
           tagline = excluded.tagline,
           description = excluded.description,
           updated_at = excluded.updated_at`
      ).bind(userId, next.name, next.tagline, next.description, now).run();
      return next;
    }
    return this.get(env, userId);
  }
}
