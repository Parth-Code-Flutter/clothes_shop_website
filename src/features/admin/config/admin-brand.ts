import { siteConfig } from "@/config/site";

/**
 * White-label settings for the admin console.
 * To re-skin the panel for a new client, edit this file only:
 * name, monogram, and the two colour palettes below.
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
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
};

export const adminBrand = {
  name: siteConfig.name,
  /** One or two letters shown in the logo mark. */
  monogram: "HB",
  consoleLabel: "Atelier Console",
  locale: "en-IN",
  currency: "INR",
  timeZone: "Asia/Kolkata",
  palettes: {
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
      success: "#6fbf96",
      successSoft: "#16261e",
      warning: "#e0a656",
      warningSoft: "#2b2114",
      danger: "#e2796d",
      dangerSoft: "#2e1916",
      info: "#86a9cf",
      infoSoft: "#172230",
    },
  } satisfies Record<"light" | "dark", AdminPalette>,
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

/** CSS custom properties for both themes, scoped to the admin root element. */
export function adminThemeCss() {
  const { light, dark } = adminBrand.palettes;
  return `[data-admin]{${declarations(light)}color-scheme:light;}.dark [data-admin]{${declarations(dark)}color-scheme:dark;}`;
}
