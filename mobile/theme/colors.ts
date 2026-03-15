import { Appearance } from "react-native";

export const darkColors = {
  bg: "#0B0B0B",
  text: "#F5F5F7",
  primary: "#20C7B7",
  primaryText: "#FFFFFF",
  muted: "rgba(245,245,247,0.55)",
  mutedMore: "rgba(245,245,247,0.35)",
  card: "rgba(255,255,255,0.06)",
  card2: "rgba(255,255,255,0.10)",
  border: "rgba(255,255,255,0.08)",
  inputBg: "rgba(255,255,255,0.08)",
  primaryAlpha: "rgba(32,199,183,0.12)",
  danger: "#FF4D4D",
  // Semantic surface
  surface: "rgba(255,255,255,0.08)",
  surfaceAlt: "#111111",
  // Brand accents
  teal: "#20C7B7",
  tealAlpha: "rgba(32,199,183,0.12)",
  green: "#22C55E",
  greenAlpha: "rgba(34,197,94,0.12)",
  orange: "#F97316",
  orangeAlpha: "rgba(249,115,22,0.12)",
  blue: "#4C7DFF",
  blueAlpha: "rgba(76,125,255,0.12)",
  // Macro semantic slots
  macroProtein: "#10B981",
  macroCarbs: "#F59E0B",
  macroFat: "#6366F1",
  macroCalories: "#F97316",
  // Typography helpers
  textPrimary: "#F5F5F7",
  textSecondary: "rgba(245,245,247,0.55)",
  textMuted: "rgba(245,245,247,0.35)",
};

// Light palette — minimalist premium, soft off-white surfaces, teal AI accent
export const lightColors = {
  bg: "#F4F5F7",
  text: "#1C1C1E",
  primary: "#20C7B7",
  primaryText: "#FFFFFF",
  muted: "#6B7280",
  mutedMore: "#9CA3AF",
  card: "#FFFFFF",
  card2: "#F3F4F6",
  border: "#E5E7EB",
  inputBg: "#FFFFFF",
  primaryAlpha: "rgba(32,199,183,0.10)",
  danger: "#EF4444",
  // Semantic surface
  surface: "#FFFFFF",
  surfaceAlt: "#F4F5F7",
  // Brand accents
  teal: "#20C7B7",
  tealAlpha: "rgba(32,199,183,0.10)",
  green: "#22C55E",
  greenAlpha: "rgba(34,197,94,0.10)",
  orange: "#F97316",
  orangeAlpha: "rgba(249,115,22,0.10)",
  blue: "#4C7DFF",
  blueAlpha: "rgba(76,125,255,0.10)",
  // Macro semantic slots
  macroProtein: "#10B981",
  macroCarbs: "#F59E0B",
  macroFat: "#6366F1",
  macroCalories: "#F97316",
  // Typography helpers
  textPrimary: "#1C1C1E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
};

export type AppColors = typeof lightColors;

export const colors: AppColors =
  Appearance.getColorScheme() === "dark" ? darkColors : lightColors;
