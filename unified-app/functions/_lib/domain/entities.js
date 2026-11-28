export const TASK_PRIORITIES = new Set(["alta", "media", "baja"]);
export const TASK_STATUSES = new Set(["pendiente", "completada"]);
export const PROJECT_PRIORITIES = new Set(["alta", "media", "baja"]);
export const PROJECT_STATUSES = new Set(["activo", "pausado", "completado", "archivado"]);
export const NOTE_KINDS = new Set(["nota", "contacto", "foto", "nfc"]);
export const NOTE_SOURCES = new Set(["manual", "nfc", "camara"]);
export const PROJECT_ROLES = new Set(["owner", "editor", "viewer"]);
export const PROJECT_ROLE_WRITE = new Set(["owner", "editor"]);
export const DOCUMENT_STATUSES = new Set(["activo", "archivado"]);

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function tagsFromRow(value) {
  const parsed = parseJson(value, []);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
}

export function serializeProject(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    status: row.status,
    priority: row.priority,
    due_date: row.due_date || null,
    color: row.color || "#8b5cf6",
    created_at: row.created_at,
    updated_at: row.updated_at || null,
    role: row.role || "owner",
    member_count: Number(row.member_count || 0),
    task_count: Number(row.task_count || 0),
    completed_task_count: Number(row.completed_task_count || 0),
  };
}

export function serializeTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    priority: row.priority,
    status: row.status,
    due_date: row.due_date || null,
    category: row.category || null,
    project_id: row.project_id || null,
    project_name: row.project_name || null,
    assignee_id: row.assignee_id || null,
    assignee_name: row.assignee_name || null,
    tags: tagsFromRow(row.tags),
    created_at: row.created_at,
    completed_at: row.completed_at || null,
  };
}

export function serializeMember(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    role: row.role,
    invited_by: row.invited_by || null,
    created_at: row.created_at,
    name: row.display_name || row.name || row.email,
    email: row.email,
    avatar: row.avatar || "lorelei",
  };
}

export function serializeDocument(row, { includeVersions = false, versions = [] } = {}) {
  const result = {
    id: row.id,
    project_id: row.project_id || null,
    project_name: row.project_name || null,
    owner_id: row.owner_id,
    title: row.title,
    content: row.content || "",
    status: row.status || "activo",
    role: row.role || null,
    created_at: row.created_at,
    updated_at: row.updated_at || null,
  };
  if (includeVersions) result.versions = versions;
  return result;
}

export function serializeDocumentVersion(row) {
  return {
    id: row.id,
    document_id: row.document_id,
    editor_id: row.editor_id || null,
    editor_name: row.editor_name || "Nexo",
    title: row.title,
    content: row.content || "",
    created_at: row.created_at,
  };
}

export function serializeActivity(row) {
  return {
    id: row.id,
    actor_id: row.actor_id || null,
    actor_name: row.actor_name || "Nexo",
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id || null,
    project_id: row.project_id || null,
    detail: parseJson(row.detail, null),
    created_at: row.created_at,
  };
}

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
