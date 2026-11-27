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
  created_at: string;
  completed_at?: string | null;
};

export type CreateTaskInput = {
  title: string;
  priority: TaskPriority;
  description?: string;
  category?: string;
  due_date?: string;
};
