import type { PreferencesInput } from "../../domain/entities/preferences";
import type { PreferencesRepository } from "../../domain/repositories/preferences-repository";

export function makePreferencesUseCases(repository: PreferencesRepository) {
  return {
    update: (input: PreferencesInput) => repository.update(input),
  };
}
