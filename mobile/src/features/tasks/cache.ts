import { getDatabase } from "../../database/db";
import type { Task } from "./types";

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
