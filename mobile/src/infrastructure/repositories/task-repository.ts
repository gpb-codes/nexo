import type { Task, CreateTaskInput, UpdateTaskInput } from "../../domain/entities/task";
import type { TaskRepository } from "../../domain/repositories/task-repository";
import { api, isNetworkError } from "../api/client";
import { endpoints } from "../api/endpoints";
import { enqueue, putTaskCache, readTasksCache, removeTaskCache, saveTasksCache } from "../storage/sqlite";

export class ApiTaskRepository implements TaskRepository {
  async list(): Promise<Task[]> {
    try {
      const data = await api<{ ok: boolean; tasks: Task[] }>(endpoints.tasks);
      await saveTasksCache(data.tasks);
      return data.tasks;
    } catch (error) {
      if (isNetworkError(error)) return readTasksCache();
      throw error;
    }
  }

  async create(input: CreateTaskInput): Promise<void> {
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

  async update(id: string, patch: UpdateTaskInput): Promise<void> {
    try {
      await api(endpoints.tasks, { method: "PUT", body: JSON.stringify({ id, ...patch }) });
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      await enqueue("tasks", "update", { id, ...patch });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await api(endpoints.tasks, { method: "DELETE", body: JSON.stringify({ id }) });
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      await enqueue("tasks", "delete", { id });
      await removeTaskCache(id);
    }
  }
}
