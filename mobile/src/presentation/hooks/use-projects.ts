import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";
import type {
  CreateProjectInput,
  InviteMemberInput,
  UpdateProjectInput,
} from "../../domain/entities/project";

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.projects });
  queryClient.invalidateQueries({ queryKey: queryKeys.documents });
};

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: () => container.useCases.projects.list() });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: queryKeys.projectDetail(id || "none"),
    queryFn: () => container.useCases.projects.get(id as string),
    enabled: !!id,
  });
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

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => container.useCases.projects.invite(input),
    onSuccess: (_member, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectDetail(input.project_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      container.useCases.projects.removeMember(projectId, userId),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectDetail(input.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}
