import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";
import type { LoginInput, RegisterInput } from "../../domain/entities/session";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: () => container.useCases.session.me(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => container.useCases.session.login(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      await queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => container.useCases.session.register(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => container.useCases.session.logout(),
    onSuccess: async () => {
      await queryClient.clear();
    },
  });
}
