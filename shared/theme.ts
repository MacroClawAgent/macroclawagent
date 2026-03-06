/**
 * Jonno — Shared Design Tokens
 *
 * Single source of truth for brand colors and spacing.
 * Used by:
 *   - mobile/   (Expo React Native — import directly)
 *   - web       (Next.js — tailwind.config.ts mirrors these values)
 *
 * When you change a color here, update the matching Tailwind class in
 * tailwind.config.ts so both platforms stay in sync.
 */

export const colors = {
  // ── Brand ────────────────────────────────────────────────
  /** Jonno primary blue */
  primary: "#0066EE",
  primaryLight: "#3B82F6",
  primaryDark: "#0050BB",

  // ── Accent ───────────────────────────────────────────────
  /** Orange — calories / Strava / energy */
  orange: "#F97316",
  orangeLight: "#FB923C",
  orangeDark: "#EA6C0A",

  /** Emerald — protein / nutrition / success */
  emerald: "#10B981",
  emeraldLight: "#34D399",
  emeraldDark: "#059669",

  /** Amber — carbs / warnings / prizes */
  amber: "#F59E0B",
  amberLight: "#FCD34D",
  amberDark: "#D97706",

  /** Indigo — AI / agent / intelligence */
  indigo: "#6366F1",
  indigoLight: "#818CF8",
  indigoDark: "#4F46E5",

  // ── Neutrals ─────────────────────────────────────────────
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  black: "#000000",

  // ── Semantic ─────────────────────────────────────────────
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  errorLight: "#FEF2F2",

  // ── Backgrounds (web = white, mobile = near-white card) ──
  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceElevated: "#FFFFFF",
  border: "#E5E7EB",
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

export type AppColors = typeof colors;
export type AppFontSizes = typeof fontSizes;
export type AppSpacing = typeof spacing;
