import { Appearance } from "react-native";

export const darkColors = {
  bg: "#0B0B0B",
  text: "#F5F5F7",
  primary: "#D4FF00",
  primaryText: "#0B0B0B",
  muted: "rgba(245,245,247,0.55)",
  mutedMore: "rgba(245,245,247,0.35)",
  card: "rgba(255,255,255,0.06)",
  card2: "rgba(255,255,255,0.10)",
  border: "rgba(255,255,255,0.08)",
  inputBg: "rgba(255,255,255,0.08)",
  primaryAlpha: "rgba(212,255,0,0.12)",
  danger: "#FF4D4D",
};

// Light palette mirrors the website (Coastal Sunrise / teal brand)
export const lightColors = {
  bg: "#FAFAFA",
  text: "#1C1C1E",
  primary: "#20C7B7",
  primaryText: "#FFFFFF",
  muted: "#6B7280",
  mutedMore: "#9CA3AF",
  card: "#FFFFFF",
  card2: "#F3F4F6",
  border: "#E5E7EB",
  inputBg: "#FFFFFF",
  primaryAlpha: "rgba(32,199,183,0.12)",
  danger: "#EF4444",
};

export type AppColors = typeof darkColors;

// Resolved once at startup — follows the device system theme.
// If the user flips their system theme the app will use the new scheme on
// next cold-start (acceptable for MVP; no mid-session hot-swap needed).
export const colors: AppColors =
  Appearance.getColorScheme() === "light" ? lightColors : darkColors;
