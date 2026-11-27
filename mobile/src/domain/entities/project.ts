export type ProjectPriority = "alta" | "media" | "baja";
export type ProjectStatus = "activo" | "pausado" | "completado" | "archivado";

export type Project = {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  created_at: string;
  updated_at?: string | null;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  priority: ProjectPriority;
};

export type UpdateProjectInput = Partial<Pick<Project, "name" | "description" | "status" | "priority">>;
