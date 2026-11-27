import type { CreateTaskInput, Task, UpdateTaskInput } from "../entities/task";

export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<void>;
  update(id: string, patch: UpdateTaskInput): Promise<void>;
  delete(id: string): Promise<void>;
  pushCreate(input: CreateTaskInput): Promise<Task>;
  pushUpdate(id: string, patch: UpdateTaskInput): Promise<void>;
  pushDelete(id: string): Promise<void>;
}
