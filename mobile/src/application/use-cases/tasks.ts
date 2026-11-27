import type { CreateTaskInput, UpdateTaskInput } from "../../domain/entities/task";
import type { TaskRepository } from "../../domain/repositories/task-repository";

export function makeTaskUseCases(repository: TaskRepository) {
  return {
    list: () => repository.list(),
    create: (input: CreateTaskInput) => repository.create(input),
    update: (id: string, patch: UpdateTaskInput) => repository.update(id, patch),
    remove: (id: string) => repository.delete(id),
  };
}
