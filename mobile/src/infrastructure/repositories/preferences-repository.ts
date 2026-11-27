import type { PreferencesInput, PreferencesResult } from "../../domain/entities/preferences";
import type { PreferencesRepository } from "../../domain/repositories/preferences-repository";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";

export class ApiPreferencesRepository implements PreferencesRepository {
  update(input: PreferencesInput): Promise<PreferencesResult> {
    return api<PreferencesResult>(endpoints.preferences, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }
}
