export type TaskPriority = "alta" | "media" | "baja";
export type TaskStatus = "pendiente" | "completada";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  category?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  assignee_id?: string | null;
  assignee_name?: string | null;
  tags?: string[];
  created_at: string;
  completed_at?: string | null;
};

export type CreateTaskInput = {
  title: string;
  priority: TaskPriority;
  description?: string;
  category?: string;
  due_date?: string;
  project_id?: string | null;
  assignee_id?: string | null;
  tags?: string[];
  clientId?: string;
};

export type UpdateTaskInput = Partial<
  Pick<
    Task,
    "title" | "description" | "priority" | "status" | "due_date" | "category" | "project_id" | "assignee_id" | "tags"
  >
>;
