-- Add theme preference to users (idempotent-ish: run once)
ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'oscuro';
