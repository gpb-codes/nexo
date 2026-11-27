import type { CreateTaskInput, Task, UpdateTaskInput } from "../entities/task";

export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<void>;
  update(id: string, patch: UpdateTaskInput): Promise<void>;
  delete(id: string): Promise<void>;
}
