-- Per-user site identity settings for Nexo.
-- Kept separate from users so fresh and existing databases can apply it safely.
CREATE TABLE IF NOT EXISTS site_settings (
  user_id TEXT PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'Nexo',
  tagline TEXT NOT NULL DEFAULT 'Centro de operaciones',
  description TEXT NOT NULL DEFAULT 'Tu segundo cerebro unificado',
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
