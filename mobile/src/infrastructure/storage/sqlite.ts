import * as SQLite from "expo-sqlite";
import type { Task } from "../../domain/entities/task";

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  database = await SQLite.openDatabaseAsync("nexo.db");
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      entity TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS tasks_cache (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return database;
}

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

export async function readTasksCache(): Promise<Task[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ payload: string }>("SELECT payload FROM tasks_cache ORDER BY updated_at DESC");
  return rows.map((row) => JSON.parse(row.payload) as Task);
}

export async function saveTasksCache(tasks: Task[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM tasks_cache");
  const now = new Date().toISOString();
  for (const task of tasks) {
    await db.runAsync(
      "INSERT INTO tasks_cache (id, payload, updated_at) VALUES (?, ?, ?)",
      task.id,
      JSON.stringify(task),
      now,
    );
  }
}

export async function putTaskCache(task: Task): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO tasks_cache (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at",
    task.id,
    JSON.stringify(task),
    new Date().toISOString(),
  );
}

export async function removeTaskCache(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM tasks_cache WHERE id = ?", id);
}
