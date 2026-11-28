import type { CreateProjectInput, InviteMemberInput, UpdateProjectInput } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/repositories/project-repository";

export function makeProjectUseCases(repository: ProjectRepository) {
  return {
    list: () => repository.list(),
    get: (id: string) => repository.get(id),
    create: (input: CreateProjectInput) => repository.create(input),
    update: (id: string, patch: UpdateProjectInput) => repository.update(id, patch),
    remove: (id: string) => repository.delete(id),
    invite: (input: InviteMemberInput) => repository.invite(input),
    removeMember: (projectId: string, userId: string) => repository.removeMember(projectId, userId),
    activity: (projectId: string) => repository.activity(projectId),
  };
}
