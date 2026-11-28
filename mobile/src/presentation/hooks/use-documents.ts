import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";
import type { CreateDocumentInput, UpdateDocumentInput } from "../../domain/entities/document";

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.documents });
  queryClient.invalidateQueries({ queryKey: queryKeys.projects });
};

export function useDocuments(projectId?: string | null) {
  return useQuery({
    queryKey: [...queryKeys.documents, projectId || "all"],
    queryFn: () => container.useCases.documents.list(projectId),
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: queryKeys.document(id || "none"),
    queryFn: () => container.useCases.documents.get(id as string),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => container.useCases.documents.create(input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateDocumentInput }) =>
      container.useCases.documents.update(id, patch),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => container.useCases.documents.remove(id),
    onSuccess: () => invalidate(queryClient),
  });
}
