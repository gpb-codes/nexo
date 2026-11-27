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

  async pushCreate(input: CreateTaskInput): Promise<Task> {
    const data = await api<{ ok: boolean; task: Task }>(endpoints.tasks, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.task;
  }

  async pushUpdate(id: string, patch: UpdateTaskInput): Promise<void> {
    await api(endpoints.tasks, { method: "PUT", body: JSON.stringify({ id, ...patch }) });
  }

  async pushDelete(id: string): Promise<void> {
    await api(endpoints.tasks, { method: "DELETE", body: JSON.stringify({ id }) });
  }

  async create(input: CreateTaskInput): Promise<void> {
    const clientId = input.clientId || `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload: CreateTaskInput = { ...input, clientId };
    try {
      const created = await this.pushCreate(payload);
      await putTaskCache({
        id: created.id,
        title: created.title,
        description: input.description,
        priority: input.priority,
        status: "pendiente",
        due_date: input.due_date ?? null,
        category: input.category ?? null,
        created_at: created.created_at,
      });
      await removeTaskCache(clientId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      await enqueue("tasks", "create", payload);
      await putTaskCache({
        id: clientId,
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
      await this.pushUpdate(id, patch);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      await enqueue("tasks", "update", { id, patch });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.pushDelete(id);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      await enqueue("tasks", "delete", { id });
      await removeTaskCache(id);
    }
  }
}
