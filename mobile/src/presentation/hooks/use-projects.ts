import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";
import type { CreateProjectInput, UpdateProjectInput } from "../../domain/entities/project";

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.projects });

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: () => container.useCases.projects.list() });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => container.useCases.projects.create(input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateProjectInput }) =>
      container.useCases.projects.update(id, patch),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => container.useCases.projects.remove(id),
    onSuccess: () => invalidate(queryClient),
  });
}
