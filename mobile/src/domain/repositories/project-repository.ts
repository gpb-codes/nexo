import type { ActivityEntry } from "../entities/collaboration";
import type {
  CreateProjectInput,
  InviteMemberInput,
  Project,
  ProjectDetail,
  ProjectMember,
  UpdateProjectInput,
} from "../entities/project";

export interface ProjectRepository {
  list(): Promise<Project[]>;
  get(id: string): Promise<ProjectDetail>;
  create(input: CreateProjectInput): Promise<void>;
  update(id: string, patch: UpdateProjectInput): Promise<void>;
  delete(id: string): Promise<void>;
  invite(input: InviteMemberInput): Promise<ProjectMember>;
  removeMember(projectId: string, userId: string): Promise<void>;
  activity(projectId: string): Promise<ActivityEntry[]>;
}
