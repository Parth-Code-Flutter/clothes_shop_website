import { siteConfig } from "@/config/site";

/**
 * White-label settings for the admin console.
 * To re-skin the panel for a new client, edit this file only:
 * name, monogram, and `theme` (pick a preset or add your own to `adminThemes`).
 */
export type AdminPalette = {
  /** Page background behind cards. */
  canvas: string;
  /** Cards, tables, popovers. */
  surface: string;
  /** Hover fills, table stripes, input backgrounds. */
  surfaceMuted: string;
  /** Primary text. */
  ink: string;
  /** Secondary text and labels. */
  inkSoft: string;
  /** Hints, placeholders, axis labels. */
  inkFaint: string;
  /** Hairline borders. */
  line: string;
  /** Emphasised borders and focus rings. */
  lineStrong: string;
  /** Brand colour: buttons, active nav, chart lines. */
  accent: string;
  /** Text placed on top of the accent colour. */
  accentInk: string;
  /** Tinted accent background for chips and highlights. */
  accentSoft: string;
  /** Sidebar and login brand panel. */
  sidebar: string;
  sidebarInk: string;
  sidebarInkSoft: string;
  sidebarLine: string;
  /** Active nav, logo mark and highlights on the dark sidebar; must stay readable on `sidebar`. */
  sidebarAccent: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
};

type AdminTheme = { label: string; light: AdminPalette; dark: AdminPalette };

export const adminThemes = {
  /** Soft graphite neutrals with a refined violet accent; sidebar sits in the same tone as the page. */
  iris: {
    label: "Graphite & Iris",
    light: {
      canvas: "#f7f7f8",
      surface: "#ffffff",
      surfaceMuted: "#f3f3f5",
      ink: "#111113",
      inkSoft: "#5d5d66",
      inkFaint: "#9a9aa3",
      line: "#ebebee",
      lineStrong: "#dcdce1",
      accent: "#6e56cf",
      accentInk: "#ffffff",
      accentSoft: "#f1eefc",
      sidebar: "#fbfbfc",
      sidebarInk: "#111113",
      sidebarInkSoft: "#6b6b74",
      sidebarLine: "#ebebee",
      sidebarAccent: "#6e56cf",
      success: "#1f8a5b",
      successSoft: "#e7f6ee",
      warning: "#b26a00",
      warningSoft: "#fdf3e1",
      danger: "#d0393e",
      dangerSoft: "#fdecec",
      info: "#2563eb",
      infoSoft: "#eaf1fe",
    },
    dark: {
      canvas: "#0a0a0c",
      surface: "#121215",
      surfaceMuted: "#19191d",
      ink: "#ededf0",
      inkSoft: "#a1a1aa",
      inkFaint: "#6b6b75",
      line: "#222228",
      lineStrong: "#2e2e36",
      accent: "#8e7cf0",
      accentInk: "#0a0a0c",
      accentSoft: "#1d1a33",
      sidebar: "#0d0d10",
      sidebarInk: "#ededf0",
      sidebarInkSoft: "#8b8b95",
      sidebarLine: "#1c1c21",
      sidebarAccent: "#a394f5",
      success: "#3ecf8e",
      successSoft: "#0f2a1e",
      warning: "#f5a524",
      warningSoft: "#2b2010",
      danger: "#f06a6f",
      dangerSoft: "#2d1416",
      info: "#60a5fa",
      infoSoft: "#10203a",
    },
  },
  /** Deep navy with steel-blue highlights. */
  midnight: {
    label: "Midnight",
    light: {
      canvas: "#f4f6fa",
      surface: "#ffffff",
      surfaceMuted: "#eef2f7",
      ink: "#0f1a2e",
      inkSoft: "#4a5568",
      inkFaint: "#8b95a7",
      line: "#e3e8f0",
      lineStrong: "#c9d2df",
      accent: "#1d3a6e",
      accentInk: "#ffffff",
      accentSoft: "#e7edf7",
      sidebar: "#0e1a33",
      sidebarInk: "#eef2f9",
      sidebarInkSoft: "#93a1bb",
      sidebarLine: "#1e2c4a",
      sidebarAccent: "#8fb0e8",
      success: "#23704f",
      successSoft: "#e3f1ea",
      warning: "#a8650f",
      warningSoft: "#f8eddc",
      danger: "#b23a3a",
      dangerSoft: "#f9e5e5",
      info: "#2b7a8c",
      infoSoft: "#e2f1f4",
    },
    dark: {
      canvas: "#0a1120",
      surface: "#111b2e",
      surfaceMuted: "#17233a",
      ink: "#e7ecf5",
      inkSoft: "#a5b1c6",
      inkFaint: "#6c7a93",
      line: "#1f2b42",
      lineStrong: "#2e3c58",
      accent: "#7fa3e3",
      accentInk: "#0a1120",
      accentSoft: "#16284a",
      sidebar: "#070d1a",
      sidebarInk: "#e7ecf5",
      sidebarInkSoft: "#8190aa",
      sidebarLine: "#17223a",
      sidebarAccent: "#8fb0e8",
      success: "#5fbf92",
      successSoft: "#10261d",
      warning: "#e3a552",
      warningSoft: "#2b2012",
      danger: "#ec7f7f",
      dangerSoft: "#2f1718",
      info: "#63b6c7",
      infoSoft: "#10252b",
    },
  },
  /** Muted forest green with sage highlights. */
  sage: {
    label: "Sage",
    light: {
      canvas: "#f4f5f1",
      surface: "#ffffff",
      surfaceMuted: "#eef0ea",
      ink: "#18201b",
      inkSoft: "#505a52",
      inkFaint: "#8d968e",
      line: "#e2e6de",
      lineStrong: "#c8cfc4",
      accent: "#3f5f4a",
      accentInk: "#ffffff",
      accentSoft: "#e6eee7",
      sidebar: "#17241d",
      sidebarInk: "#eef2ec",
      sidebarInkSoft: "#98a79b",
      sidebarLine: "#263529",
      sidebarAccent: "#a9c6a8",
      success: "#2f7350",
      successSoft: "#e3f0e7",
      warning: "#a3661a",
      warningSoft: "#f7ecdb",
      danger: "#a8423a",
      dangerSoft: "#f7e4e1",
      info: "#3d6488",
      infoSoft: "#e4ecf3",
    },
    dark: {
      canvas: "#0d120f",
      surface: "#141b17",
      surfaceMuted: "#1b241f",
      ink: "#e8ede8",
      inkSoft: "#a9b5ab",
      inkFaint: "#707d73",
      line: "#232d27",
      lineStrong: "#334039",
      accent: "#93b89a",
      accentInk: "#0d120f",
      accentSoft: "#1d2b22",
      sidebar: "#0a0f0c",
      sidebarInk: "#e8ede8",
      sidebarInkSoft: "#86948a",
      sidebarLine: "#1c2520",
      sidebarAccent: "#a9c6a8",
      success: "#6fc196",
      successSoft: "#12261b",
      warning: "#dfa758",
      warningSoft: "#2a2114",
      danger: "#e58479",
      dangerSoft: "#2d1917",
      info: "#8ab0d4",
      infoSoft: "#152230",
    },
  },
  /** Warm ivory and antique gold. */
  heritage: {
    label: "Heritage",
    light: {
      canvas: "#f6f3ee",
      surface: "#ffffff",
      surfaceMuted: "#f1ede6",
      ink: "#1a1714",
      inkSoft: "#5f574d",
      inkFaint: "#968c7f",
      line: "#e6dfd4",
      lineStrong: "#cfc5b6",
      accent: "#9a7442",
      accentInk: "#ffffff",
      accentSoft: "#f3ebdf",
      sidebar: "#16130f",
      sidebarInk: "#f4efe7",
      sidebarInkSoft: "#a69c8e",
      sidebarLine: "#2b2620",
      sidebarAccent: "#c9a46a",
      success: "#2f6b4f",
      successSoft: "#e5f0ea",
      warning: "#a1661a",
      warningSoft: "#f7ecdc",
      danger: "#a3352b",
      dangerSoft: "#f6e3e0",
      info: "#3a5a7c",
      infoSoft: "#e4ebf2",
    },
    dark: {
      canvas: "#0f0e0c",
      surface: "#171512",
      surfaceMuted: "#1f1c18",
      ink: "#f2ede5",
      inkSoft: "#b3a999",
      inkFaint: "#7d7466",
      line: "#2a2621",
      lineStrong: "#3d372f",
      accent: "#c9a46a",
      accentInk: "#16130f",
      accentSoft: "#2a2218",
      sidebar: "#0b0a08",
      sidebarInk: "#f2ede5",
      sidebarInkSoft: "#8f8676",
      sidebarLine: "#221f1a",
      sidebarAccent: "#c9a46a",
      success: "#6fbf96",
      successSoft: "#16261e",
      warning: "#e0a656",
      warningSoft: "#2b2114",
      danger: "#e2796d",
      dangerSoft: "#2e1916",
      info: "#86a9cf",
      infoSoft: "#172230",
    },
  },
} satisfies Record<string, AdminTheme>;

export type AdminThemeName = keyof typeof adminThemes;

export const adminBrand = {
  name: siteConfig.name,
  /** One or two letters shown in the logo mark. */
  monogram: "HB",
  consoleLabel: "Atelier Console",
  locale: "en-IN",
  currency: "INR",
  timeZone: "Asia/Kolkata",
  /** Colour preset from `adminThemes`. */
  theme: "iris" satisfies AdminThemeName,
} as const;

const TOKEN_NAMES: Record<keyof AdminPalette, string> = {
  canvas: "canvas",
  surface: "surface",
  surfaceMuted: "surface-muted",
  ink: "ink",
  inkSoft: "ink-soft",
  inkFaint: "ink-faint",
  line: "line",
  lineStrong: "line-strong",
  accent: "accent",
  accentInk: "accent-ink",
  accentSoft: "accent-soft",
  sidebar: "sidebar",
  sidebarInk: "sidebar-ink",
  sidebarInkSoft: "sidebar-ink-soft",
  sidebarLine: "sidebar-line",
  sidebarAccent: "sidebar-accent",
  success: "success",
  successSoft: "success-soft",
  warning: "warning",
  warningSoft: "warning-soft",
  danger: "danger",
  dangerSoft: "danger-soft",
  info: "info",
  infoSoft: "info-soft",
};

function declarations(palette: AdminPalette) {
  return (Object.keys(TOKEN_NAMES) as (keyof AdminPalette)[])
    .map((key) => `--adm-${TOKEN_NAMES[key]}:${palette[key]};`)
    .join("");
}

/**
 * CSS custom properties for both themes, scoped to the admin root element.
 * `data-admin-dark` pins a subtree (e.g. the login brand panel) to the dark palette in either mode.
 */
export function adminThemeCss(theme: AdminThemeName = adminBrand.theme) {
  const { light, dark } = adminThemes[theme];
  const darkBlock = `${declarations(dark)}color-scheme:dark;`;
  return `[data-admin]{${declarations(light)}color-scheme:light;}.dark [data-admin]{${darkBlock}}[data-admin-dark]{${darkBlock}}`;
}
