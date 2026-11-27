import { api, endpoints, isNetworkError } from "../../infrastructure/api/client";
import { enqueue } from "../../database/outbox";
import { putTaskCache, readTasksCache, removeTaskCache, saveTasksCache } from "./cache";
import type { CreateTaskInput, Task } from "./types";

export async function listTasks(): Promise<Task[]> {
  try {
    const data = await api<{ ok: boolean; tasks: Task[] }>(endpoints.tasks);
    await saveTasksCache(data.tasks);
    return data.tasks;
  } catch (error) {
    if (isNetworkError(error)) return readTasksCache();
    throw error;
  }
}

export async function createTask(input: CreateTaskInput): Promise<void> {
  try {
    await api(endpoints.tasks, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    await enqueue("tasks", "create", input);
    await putTaskCache({
      id: `local_${Date.now()}`,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: "pendiente",
      due_date: input.due_date ?? null,
      category: input.category ?? null,
      created_at: new Date().toISOString(),
    });
  }
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<void> {
  try {
    await api(endpoints.tasks, { method: "PUT", body: JSON.stringify({ id, ...patch }) });
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    await enqueue("tasks", "update", { id, ...patch });
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await api(endpoints.tasks, { method: "DELETE", body: JSON.stringify({ id }) });
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    await enqueue("tasks", "delete", { id });
    await removeTaskCache(id);
  }
}
