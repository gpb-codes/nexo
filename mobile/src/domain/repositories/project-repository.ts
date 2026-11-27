import type { CreateProjectInput, Project, UpdateProjectInput } from "../entities/project";

export interface ProjectRepository {
  list(): Promise<Project[]>;
  create(input: CreateProjectInput): Promise<void>;
  update(id: string, patch: UpdateProjectInput): Promise<void>;
  delete(id: string): Promise<void>;
}
