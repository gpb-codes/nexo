import type { CreateDocumentInput, Document, UpdateDocumentInput } from "../../domain/entities/document";
import type { DocumentRepository } from "../../domain/repositories/document-repository";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";

export class ApiDocumentRepository implements DocumentRepository {
  async list(projectId?: string | null): Promise<Document[]> {
    const suffix = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    const data = await api<{ ok: boolean; documents: Document[] }>(`${endpoints.documents}${suffix}`);
    return data.documents;
  }

  async get(id: string): Promise<Document> {
    const data = await api<{ ok: boolean; document: Document }>(
      `${endpoints.documents}?id=${encodeURIComponent(id)}`,
    );
    return data.document;
  }

  async create(input: CreateDocumentInput): Promise<void> {
    await api(endpoints.documents, { method: "POST", body: JSON.stringify(input) });
  }

  async update(id: string, patch: UpdateDocumentInput): Promise<void> {
    await api(endpoints.documents, { method: "PUT", body: JSON.stringify({ id, ...patch }) });
  }

  async delete(id: string): Promise<void> {
    await api(endpoints.documents, { method: "DELETE", body: JSON.stringify({ id }) });
  }
}
