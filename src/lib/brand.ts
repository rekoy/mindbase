import type { Brand, Project } from "@/lib/types";

export const COLOR_ROLES = ["Primer", "Sekunder", "Aksen", "Latar", "Teks"];

export const DEFAULT_BRAND: Brand = {
  colors: [
    { role: "Primer", hex: "#172b36" },
    { role: "Sekunder", hex: "#114c5a" },
    { role: "Aksen", hex: "#ffc801" },
    { role: "Latar", hex: "#f1f6f4" },
    { role: "Teks", hex: "#172b36" },
  ],
  headingFont: "Plus Jakarta Sans",
  bodyFont: "Inter",
  logo: null,
  assets: [],
  wordsUsed: "",
  claimRules: "",
  linkPlain: "",
  linkTracking: "",
};

export const FONTS = [
  "Plus Jakarta Sans",
  "Inter",
  "Poppins",
  "Montserrat",
  "Space Grotesk",
  "DM Sans",
  "Nunito",
  "Playfair Display",
  "DM Serif Display",
  "Bebas Neue",
  "Press Start 2P",
];

export const MAX_COLORS = 6;
export const MAX_ASSETS = 8;

export function brandOf(project: Project): Brand {
  return { ...DEFAULT_BRAND, ...project.brand };
}

export function colorFor(brand: Brand, role: string, fallback: string) {
  return brand.colors.find((c) => c.role === role)?.hex ?? fallback;
}

export function googleFontsHref(fonts: string[]) {
  const families = [...new Set(fonts)].map((f) => `family=${f.replaceAll(" ", "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colors. */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
