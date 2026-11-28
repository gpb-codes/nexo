-- Colaboración: miembros por proyecto, documentos compartidos, versiones y actividad.
-- Migración no destructiva: solo crea tablas/índices y añade columnas nuevas.

CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Los proyectos existentes conservan a su creador como owner.
INSERT OR IGNORE INTO project_members (id, project_id, user_id, role, created_at)
SELECT 'pm_' || lower(hex(randomblob(8))), id, user_id, 'owner', created_at
FROM projects;

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'activo',
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  editor_id TEXT,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  project_id TEXT,
  detail TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (actor_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_log(actor_id, created_at DESC);

ALTER TABLE projects ADD COLUMN due_date TEXT;
ALTER TABLE projects ADD COLUMN color TEXT DEFAULT '#8b5cf6';

ALTER TABLE tasks ADD COLUMN project_id TEXT;
ALTER TABLE tasks ADD COLUMN assignee_id TEXT;
ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
