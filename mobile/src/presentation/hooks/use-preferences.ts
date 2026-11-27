import { useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "../../application/container";
import { queryKeys } from "../../application/query-keys";
import type { PreferencesInput } from "../../domain/entities/preferences";

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PreferencesInput) => container.useCases.preferences.update(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      await queryClient.invalidateQueries({ queryKey: queryKeys.preferences });
    },
  });
}
