import type { CreateDocumentInput, UpdateDocumentInput } from "../../domain/entities/document";
import type { DocumentRepository } from "../../domain/repositories/document-repository";

export function makeDocumentUseCases(repository: DocumentRepository) {
  return {
    list: (projectId?: string | null) => repository.list(projectId),
    get: (id: string) => repository.get(id),
    create: (input: CreateDocumentInput) => repository.create(input),
    update: (id: string, patch: UpdateDocumentInput) => repository.update(id, patch),
    remove: (id: string) => repository.delete(id),
  };
}
