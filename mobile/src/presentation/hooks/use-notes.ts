import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";
import type { CreateNoteInput } from "../../domain/entities/note";

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.notes });

export function useNotes() {
  return useQuery({ queryKey: queryKeys.notes, queryFn: () => container.useCases.notes.list() });
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: [...queryKeys.notes, id],
    queryFn: () => container.useCases.notes.get(id as string),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => container.useCases.notes.create(input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => container.useCases.notes.remove(id),
    onSuccess: () => invalidate(queryClient),
  });
}
