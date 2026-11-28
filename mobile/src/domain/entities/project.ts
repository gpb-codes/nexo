import type { ActivityEntry } from "./collaboration";
import type { Document } from "./document";
import type { Task } from "./task";

export type ProjectPriority = "alta" | "media" | "baja";
export type ProjectStatus = "activo" | "pausado" | "completado" | "archivado";
export type ProjectRole = "owner" | "editor" | "viewer";

export type Project = {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  due_date?: string | null;
  color?: string;
  role?: ProjectRole;
  member_count?: number;
  task_count?: number;
  completed_task_count?: number;
  created_at: string;
  updated_at?: string | null;
};

export type ProjectMember = {
  id: string;
  user_id: string;
  role: ProjectRole;
  invited_by?: string | null;
  created_at: string;
  name: string;
  email: string;
  avatar?: string;
};

export type ProjectDetail = {
  project: Project;
  members: ProjectMember[];
  documents: Document[];
  tasks: Task[];
  activity: ActivityEntry[];
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  priority: ProjectPriority;
  due_date?: string;
  color?: string;
};

export type UpdateProjectInput = Partial<
  Pick<Project, "name" | "description" | "status" | "priority" | "due_date" | "color">
>;

export type InviteMemberInput = {
  project_id: string;
  email: string;
  role: "editor" | "viewer";
};
