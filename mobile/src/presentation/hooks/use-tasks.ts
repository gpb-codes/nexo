import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";
import type { CreateTaskInput, UpdateTaskInput } from "../../domain/entities/task";

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.tasks });

export function useTasks() {
  return useQuery({ queryKey: queryKeys.tasks, queryFn: () => container.useCases.tasks.list() });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => container.useCases.tasks.create(input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTaskInput }) =>
      container.useCases.tasks.update(id, patch),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => container.useCases.tasks.remove(id),
    onSuccess: () => invalidate(queryClient),
  });
}
