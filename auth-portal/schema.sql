CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT DEFAULT 'lorelei',
  accent TEXT DEFAULT '#8b5cf6',
  display_name TEXT,
  created_at TEXT NOT NULL,
  last_login TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
