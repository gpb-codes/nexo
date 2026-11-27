import { api, endpoints } from "../../infrastructure/api/client";
import type { CreateProjectInput, Project } from "./types";

export async function listProjects(): Promise<Project[]> {
  const data = await api<{ ok: boolean; projects: Project[] }>(endpoints.projects);
  return data.projects;
}

export async function createProject(input: CreateProjectInput): Promise<void> {
  await api(endpoints.projects, { method: "POST", body: JSON.stringify(input) });
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<void> {
  await api(endpoints.projects, { method: "PUT", body: JSON.stringify({ id, ...patch }) });
}

export async function deleteProject(id: string): Promise<void> {
  await api(endpoints.projects, { method: "DELETE", body: JSON.stringify({ id }) });
}
