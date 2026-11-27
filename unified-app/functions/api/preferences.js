import { getSessionUser } from "../_lib/auth.js";

const jsonHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...extra,
});

const ALLOWED_AVATARS = new Set(["lorelei", "micah", "avataaars", "bottts", "fun-emoji", "notionists", "adventurer", "thumbs"]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const SITE_DEFAULTS = {
  name: "Nexo",
  tagline: "Centro de operaciones",
  description: "Tu segundo cerebro unificado",
};

function readSiteName(value, fallback) {
  if (value === undefined) return { value: fallback };
  const v = String(value || "").trim();
  if (v.length < 1 || v.length > 40) {
    return { error: "El nombre de la web debe tener entre 1 y 40 caracteres." };
  }
  return { value: v };
}

function readSiteText(value, fallback, max, label) {
  if (value === undefined) return { value: fallback };
  const v = String(value || "").trim();
  if (v.length > max) {
    return { error: `${label} no puede superar ${max} caracteres.` };
  }
  return { value: v };
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

    const updates = [];
    const values = [];
    const currentSite = user.site || SITE_DEFAULTS;

    if (body.avatar !== undefined && body.avatar !== null) {
      const v = String(body.avatar);
      if (!ALLOWED_AVATARS.has(v)) {
        return new Response(JSON.stringify({ error: "Avatar inválido." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("avatar = ?"); values.push(v);
    }
    if (body.accent !== undefined && body.accent !== null) {
      const v = String(body.accent);
      if (!HEX_COLOR.test(v)) {
        return new Response(JSON.stringify({ error: "Color inválido." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("accent = ?"); values.push(v);
    }
    if (body.theme !== undefined && body.theme !== null) {
      const v = String(body.theme);
      if (v !== "claro" && v !== "oscuro") {
        return new Response(JSON.stringify({ error: "Tema inválido." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("theme = ?"); values.push(v);
    }
    if (body.displayName !== undefined) {
      const v = String(body.displayName || "").trim();
      if (v.length > 80) {
        return new Response(JSON.stringify({ error: "Nombre para mostrar inválido." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("display_name = ?"); values.push(v || null);
    }

    if (body.aiApiKey !== undefined) {
      const v = String(body.aiApiKey || "").trim();
      if (v.length > 512) {
        return new Response(JSON.stringify({ error: "La API key del asistente de IA es muy larga." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("ai_api_key = ?"); values.push(v || null);
    }
    if (body.aiModel !== undefined) {
      const v = String(body.aiModel || "").trim();
      if (v.length > 80) {
        return new Response(JSON.stringify({ error: "El modelo del asistente de IA es muy largo." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("ai_model = ?"); values.push(v || null);
    }
    if (body.aiBaseUrl !== undefined) {
      const v = String(body.aiBaseUrl || "").trim();
      if (v.length > 200) {
        return new Response(JSON.stringify({ error: "El endpoint del asistente de IA es muy largo." }), { status: 400, headers: jsonHeaders() });
      }
      updates.push("ai_base_url = ?"); values.push(v || null);
    }

    const siteChanged = body.siteName !== undefined || body.siteTagline !== undefined || body.siteDescription !== undefined;
    let site = currentSite;

    if (siteChanged) {
      const name = readSiteName(body.siteName, currentSite.name);
      if (name.error) return new Response(JSON.stringify({ error: name.error }), { status: 400, headers: jsonHeaders() });

      const tagline = readSiteText(body.siteTagline, currentSite.tagline, 80, "El subtítulo");
      if (tagline.error) return new Response(JSON.stringify({ error: tagline.error }), { status: 400, headers: jsonHeaders() });

      const description = readSiteText(body.siteDescription, currentSite.description, 160, "La descripción");
      if (description.error) return new Response(JSON.stringify({ error: description.error }), { status: 400, headers: jsonHeaders() });

      site = { name: name.value, tagline: tagline.value, description: description.value };
    }

    if (updates.length === 0 && !siteChanged) {
      return new Response(JSON.stringify({ ok: true, message: "Sin cambios.", site }), { status: 200, headers: jsonHeaders() });
    }

    if (updates.length > 0) {
      values.push(user.id);
      await env.DB.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
    }

    if (siteChanged) {
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO site_settings (user_id, site_name, tagline, description, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           site_name = excluded.site_name,
           tagline = excluded.tagline,
           description = excluded.description,
           updated_at = excluded.updated_at`
      ).bind(user.id, site.name, site.tagline, site.description, now).run();
    }

    return new Response(JSON.stringify({ ok: true, message: "Preferencias actualizadas.", site }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
