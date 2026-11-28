import type { ActivityEntry } from "../../domain/entities/collaboration";
import type {
  CreateProjectInput,
  InviteMemberInput,
  Project,
  ProjectDetail,
  ProjectMember,
  UpdateProjectInput,
} from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/repositories/project-repository";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";

export class ApiProjectRepository implements ProjectRepository {
  async list(): Promise<Project[]> {
    const data = await api<{ ok: boolean; projects: Project[] }>(endpoints.projects);
    return data.projects;
  }

  async get(id: string): Promise<ProjectDetail> {
    const data = await api<{ ok: boolean } & ProjectDetail>(
      `${endpoints.projects}?id=${encodeURIComponent(id)}`,
    );
    return { project: data.project, members: data.members, documents: data.documents, tasks: data.tasks, activity: data.activity };
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

  async invite(input: InviteMemberInput): Promise<ProjectMember> {
    const data = await api<{ ok: boolean; member: ProjectMember }>(endpoints.projectMembers, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.member;
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    await api(endpoints.projectMembers, {
      method: "DELETE",
      body: JSON.stringify({ projectId, userId }),
    });
  }

  async activity(projectId: string): Promise<ActivityEntry[]> {
    const data = await api<{ ok: boolean; activity: ActivityEntry[] }>(
      `${endpoints.activity}?projectId=${encodeURIComponent(projectId)}`,
    );
    return data.activity;
  }
}
