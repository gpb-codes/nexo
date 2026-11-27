export const palette = {
  purple: "#8b5cf6",
  purpleSoft: "#a78bfa",
  sky: "#7dd3fc",
  cyan: "#67e8f9",
  metal: "#e8eaed",
  whiteMetal: "#dfe6ff",
  darkBg: "#050924",
  darkPanel: "#0f1022",
  lightBg: "#f8fafc",
  lightPanel: "#eef2f8",
};

export const theme = {
  dark: {
    background: palette.darkBg,
    panel: palette.darkPanel,
    text: palette.whiteMetal,
    muted: "#b7a7d9",
    accent: palette.purpleSoft,
    sky: palette.sky,
    border: "rgba(167,139,250,0.18)",
  },
  light: {
    background: palette.lightBg,
    panel: palette.lightPanel,
    text: "#1e293b",
    muted: "#64748b",
    accent: palette.purple,
    sky: "#0284c7",
    border: "rgba(94,124,201,0.2)",
  },
} as const;

export type AppTheme = (typeof theme)[keyof typeof theme];
