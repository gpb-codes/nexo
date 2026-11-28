import type { CreateDocumentInput, Document, UpdateDocumentInput } from "../entities/document";

export interface DocumentRepository {
  list(projectId?: string | null): Promise<Document[]>;
  get(id: string): Promise<Document>;
  create(input: CreateDocumentInput): Promise<void>;
  update(id: string, patch: UpdateDocumentInput): Promise<void>;
  delete(id: string): Promise<void>;
}
