import { getSessionUser } from "../_lib/auth.js";

const jsonHeaders = (extra = {}) => ({ "Content-Type": "application/json", ...extra });
const ALLOWED_KINDS = new Set(["nota", "contacto", "foto", "nfc"]);
const ALLOWED_SOURCES = new Set(["manual", "nfc", "camara"]);
const MAX_IMAGE_CHARS = 950000;
const IMAGE_PREFIX = /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/;

function text(value, max) {
  return String(value || "").trim().slice(0, max);
}

function cleanImage(value) {
  if (value === undefined || value === null || value === "") return { value: null };
  if (typeof value !== "string") return { error: "Imagen inválida." };
  if (value.length > MAX_IMAGE_CHARS) return { error: "La imagen es demasiado grande. Intenta con una foto más pequeña." };
  if (!IMAGE_PREFIX.test(value)) return { error: "Formato de imagen no permitido." };
  return { value };
}

function serializeNote(row) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    content: row.content || "",
    contact: {
      name: row.contact_name || "",
      phone: row.contact_phone || "",
      email: row.contact_email || "",
      org: row.contact_org || "",
    },
    source: row.source,
    hasImage: !!Number(row.has_image),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const row = await env.DB.prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?")
        .bind(String(id), user.id).first();
      if (!row) return new Response(JSON.stringify({ error: "Nota no encontrada." }), { status: 404, headers: jsonHeaders() });
      return new Response(JSON.stringify({
        ok: true,
        note: {
          ...serializeNote({ ...row, has_image: row.image_data ? 1 : 0 }),
          image: row.image_data || null,
        },
      }), { status: 200, headers: jsonHeaders() });
    }

    const { results } = await env.DB.prepare(
      `SELECT id, kind, title, content, contact_name, contact_phone, contact_email, contact_org,
              source, created_at, updated_at,
              CASE WHEN image_data IS NOT NULL AND length(image_data) > 0 THEN 1 ELSE 0 END AS has_image
       FROM notes WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(user.id).all();

    return new Response(JSON.stringify({ ok: true, notes: (results || []).map(serializeNote) }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });

    let body;
    try { body = await request.json(); } catch { body = {}; }

    const kind = ALLOWED_KINDS.has(body.kind) ? body.kind : "nota";
    const source = ALLOWED_SOURCES.has(body.source) ? body.source : "manual";
    const contact = body.contact && typeof body.contact === "object" ? body.contact : {};
    const contactName = text(contact.name, 120);
    const contactPhone = text(contact.phone, 80);
    const contactEmail = text(contact.email, 160);
    const contactOrg = text(contact.org, 120);
    const content = text(body.content, 10000);
    let title = text(body.title, 120);

    if (!title && contactName) title = contactName;
    if (!title && content) title = content.split("\n")[0].slice(0, 80);
    if (!title) title = kind === "foto" ? "Foto" : kind === "contacto" ? "Contacto" : "Nota";

    const image = cleanImage(body.image);
    if (image.error) return new Response(JSON.stringify({ error: image.error }), { status: 400, headers: jsonHeaders() });
    if (kind === "foto" && !image.value) {
      return new Response(JSON.stringify({ error: "La foto no contiene una imagen válida." }), { status: 400, headers: jsonHeaders() });
    }

    const id = "n_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO notes
        (id, user_id, kind, title, content, contact_name, contact_phone, contact_email, contact_org, image_data, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, user.id, kind, title, content, contactName, contactPhone, contactEmail, contactOrg,
      image.value, source, now
    ).run();

    return new Response(JSON.stringify({
      ok: true,
      note: {
        id, kind, title, content, source,
        contact: { name: contactName, phone: contactPhone, email: contactEmail, org: contactOrg },
        hasImage: !!image.value,
        createdAt: now,
      },
    }), { status: 201, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const user = await getSessionUser(env, request);
    if (!user) return new Response(JSON.stringify({ error: "No autenticado." }), { status: 401, headers: jsonHeaders() });

    let body;
    try { body = await request.json(); } catch { body = {}; }
    const id = String(body.id || "").trim();
    if (!id) return new Response(JSON.stringify({ error: "id requerido." }), { status: 400, headers: jsonHeaders() });

    const result = await env.DB.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").bind(id, user.id).run();
    if (!result || result.meta?.changes === 0) {
      return new Response(JSON.stringify({ error: "Nota no encontrada." }), { status: 404, headers: jsonHeaders() });
    }

    return new Response(JSON.stringify({ ok: true, message: "Nota eliminada." }), { status: 200, headers: jsonHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno." }), { status: 500, headers: jsonHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
