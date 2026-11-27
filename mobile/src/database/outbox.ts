import { getDatabase } from "./db";

export type OutboxItem = {
  id: string;
  entity: string;
  operation: string;
  payload: string;
  created_at: string;
  status: string;
  attempts: number;
};

export async function enqueue(entity: string, operation: string, payload: unknown): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO outbox (id, entity, operation, payload, created_at) VALUES (?, ?, ?, ?, ?)",
    `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    entity,
    operation,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export async function pendingChanges(): Promise<OutboxItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<OutboxItem>("SELECT * FROM outbox WHERE status = 'pending' ORDER BY created_at ASC");
}

export async function markDone(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE outbox SET status = 'done' WHERE id = ?", id);
}

export async function markFailed(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE outbox SET status = 'failed', attempts = attempts + 1 WHERE id = ?", id);
}
