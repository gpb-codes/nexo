import { api, endpoints } from "../../infrastructure/api/client";

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
};

export type PreferencesInput = {
  siteName?: string;
  siteTagline?: string;
  siteDescription?: string;
  displayName?: string | null;
  theme?: "claro" | "oscuro";
  accent?: string;
  avatar?: string;
};

export async function updatePreferences(input: PreferencesInput): Promise<{ ok: boolean; site: SiteSettings }> {
  return api(endpoints.preferences, { method: "PUT", body: JSON.stringify(input) });
}
