import type { ActivityEntry } from "./collaboration";

export type DocumentStatus = "activo" | "archivado";

export type DocumentVersion = {
  id: string;
  document_id: string;
  editor_id?: string | null;
  editor_name: string;
  title: string;
  content: string;
  created_at: string;
};

export type Document = {
  id: string;
  project_id?: string | null;
  project_name?: string | null;
  owner_id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  role?: string | null;
  created_at: string;
  updated_at?: string | null;
  versions?: DocumentVersion[];
  activity?: ActivityEntry[];
};

export type CreateDocumentInput = {
  title: string;
  content?: string;
  status?: DocumentStatus;
  project_id?: string | null;
};

export type UpdateDocumentInput = Partial<Pick<Document, "title" | "content" | "status" | "project_id">>;
