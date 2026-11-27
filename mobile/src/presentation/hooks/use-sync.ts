import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";

export function usePendingChanges() {
  return useQuery({
    queryKey: ["outbox"],
    queryFn: () => container.useCases.sync.pendingCount(),
    refetchInterval: 15000,
  });
}

export function useSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => container.useCases.sync.run(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      await queryClient.invalidateQueries({ queryKey: ["outbox"] });
    },
  });
}
