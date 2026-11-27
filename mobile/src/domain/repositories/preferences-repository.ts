import type { PreferencesInput, PreferencesResult } from "../entities/preferences";

export interface PreferencesRepository {
  update(input: PreferencesInput): Promise<PreferencesResult>;
}
