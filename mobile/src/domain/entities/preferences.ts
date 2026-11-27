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

export type PreferencesResult = { ok: boolean; site: SiteSettings };
