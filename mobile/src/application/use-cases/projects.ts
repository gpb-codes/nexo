import type { CreateProjectInput, UpdateProjectInput } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/repositories/project-repository";

export function makeProjectUseCases(repository: ProjectRepository) {
  return {
    list: () => repository.list(),
    create: (input: CreateProjectInput) => repository.create(input),
    update: (id: string, patch: UpdateProjectInput) => repository.update(id, patch),
    remove: (id: string) => repository.delete(id),
  };
}
