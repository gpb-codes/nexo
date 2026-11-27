-- Idempotency key for offline-created tasks.
ALTER TABLE tasks ADD COLUMN client_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_user_client ON tasks(user_id, client_id) WHERE client_id IS NOT NULL;
