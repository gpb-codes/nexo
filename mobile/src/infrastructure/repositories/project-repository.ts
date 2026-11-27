import type { CreateProjectInput, Project, UpdateProjectInput } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/repositories/project-repository";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";

export class ApiProjectRepository implements ProjectRepository {
  async list(): Promise<Project[]> {
    const data = await api<{ ok: boolean; projects: Project[] }>(endpoints.projects);
    return data.projects;
  }
  async create(input: CreateProjectInput): Promise<void> {
    await api(endpoints.projects, { method: "POST", body: JSON.stringify(input) });
  }
  async update(id: string, patch: UpdateProjectInput): Promise<void> {
    await api(endpoints.projects, { method: "PUT", body: JSON.stringify({ id, ...patch }) });
  }
  async delete(id: string): Promise<void> {
    await api(endpoints.projects, { method: "DELETE", body: JSON.stringify({ id }) });
  }
}
