export const palette = {
  purple: "#8b5cf6",
  purpleSoft: "#a78bfa",
  sky: "#7dd3fc",
  cyan: "#67e8f9",
  metal: "#e8eaed",
  whiteMetal: "#f8fafc",
  darkBg: "#050924",
  darkPanel: "#0f1022",
  lightBg: "#f8fafc",
  lightPanel: "#ffffff",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const theme = {
  dark: {
    background: palette.darkBg,
    panel: palette.darkPanel,
    surfaceRaised: "#14152b",
    surfaceSoft: "rgba(255,255,255,0.05)",
    text: palette.whiteMetal,
    muted: "#b7a7d9",
    faint: "#8b7aa8",
    accent: palette.purpleSoft,
    accentStrong: palette.purple,
    accentSoft: "rgba(139,92,246,0.16)",
    sky: palette.sky,
    cyan: palette.cyan,
    border: "rgba(167,139,250,0.18)",
    borderStrong: "rgba(167,139,250,0.32)",
    danger: "#f87171",
    dangerSoft: "rgba(248,113,113,0.12)",
    success: "#34d399",
    warning: "#fbbf24",
    onAccent: "#ffffff",
  },
  light: {
    background: palette.lightBg,
    panel: palette.lightPanel,
    surfaceRaised: "#f1f5f9",
    surfaceSoft: "rgba(15,23,42,0.04)",
    text: "#0f172a",
    muted: "#64748b",
    faint: "#94a3b8",
    accent: palette.purple,
    accentStrong: "#7c3aed",
    accentSoft: "rgba(139,92,246,0.12)",
    sky: "#0284c7",
    cyan: "#0891b2",
    border: "rgba(15,23,42,0.10)",
    borderStrong: "rgba(15,23,42,0.18)",
    danger: "#dc2626",
    dangerSoft: "rgba(220,38,38,0.10)",
    success: "#059669",
    warning: "#d97706",
    onAccent: "#ffffff",
  },
} as const;

export type AppTheme = (typeof theme)[keyof typeof theme];
export type AppScheme = keyof typeof theme;
