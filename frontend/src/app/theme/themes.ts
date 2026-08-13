/**
 * Central theme registry for Flowty.
 *
 * A theme is applied by setting `data-theme="<id>"` on <html>; the actual
 * palette lives in `src/styles/theme.css` under `[data-theme="..."]` blocks
 * that define the `--flowty-*` custom properties used across the app.
 */

export type ThemeId =
  | "cozy"
  | "light"
  | "dark"
  | "blueprint"
  | "night"
  | "forest"
  | "sunset";

export const DEFAULT_THEME_ID: ThemeId = "cozy";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "cozy",
    name: "Cozy",
    description: "Warm paper tones, the original Flowty look",
  },
  {
    id: "light",
    name: "Light",
    description: "Clean, bright minimal palette",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Low-light dark palette for late sessions",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    description: "Cool drafting-blueprint blues",
  },
  {
    id: "night",
    name: "Night Sky",
    description: "Deep indigo night palette",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Calm woodland greens",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm dusk oranges and pinks",
  },
];

const THEME_IDS = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: string): value is ThemeId {
  return THEME_IDS.has(value);
}
