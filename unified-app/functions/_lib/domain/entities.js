export const TASK_PRIORITIES = new Set(["alta", "media", "baja"]);
export const TASK_STATUSES = new Set(["pendiente", "completada"]);
export const PROJECT_PRIORITIES = new Set(["alta", "media", "baja"]);
export const PROJECT_STATUSES = new Set(["activo", "pausado", "completado", "archivado"]);
export const NOTE_KINDS = new Set(["nota", "contacto", "foto", "nfc"]);
export const NOTE_SOURCES = new Set(["manual", "nfc", "camara"]);

export function serializeNote(row) {
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

export function safeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar || "lorelei",
    accent: row.accent || "#8b5cf6",
    theme: row.theme || "oscuro",
    displayName: row.display_name || row.name,
    aiApiKey: row.ai_api_key || null,
    aiModel: row.ai_model || null,
    aiBaseUrl: row.ai_base_url || null,
    createdAt: row.created_at,
    lastLogin: row.last_login || null,
    site: {
      name: row.site_name || "Nexo",
      tagline: row.tagline || "Centro de operaciones",
      description: row.description || "Tu segundo cerebro unificado",
    },
  };
}
