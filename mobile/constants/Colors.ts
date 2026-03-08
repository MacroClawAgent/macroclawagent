/**
 * Jonno mobile color tokens.
 * Mirrors shared/theme.ts — keep in sync manually.
 */
const Colors = {
  light: {
    // Text
    text: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",

    // Backgrounds
    background: "#FFFFFF",
    surface: "#F9FAFB",
    surfaceElevated: "#FFFFFF",

    // Brand
    tint: "#0066EE",
    primary: "#0066EE",
    primaryLight: "#3B82F6",

    // Accents
    orange: "#F97316",
    emerald: "#10B981",
    amber: "#F59E0B",
    indigo: "#6366F1",

    // Tab bar
    tabIconDefault: "#D1D5DB",
    tabIconSelected: "#0066EE",
    tabBarBackground: "#FFFFFF",

    // Borders
    border: "#E5E7EB",

    // Semantic
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
} as const;

export default Colors;
export type ColorScheme = keyof typeof Colors;
