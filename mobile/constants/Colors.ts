/**
 * Jonno mobile color tokens.
 * Pulled from shared/theme.ts — change colors there to update both web and app.
 */
import { colors } from "../../shared/theme";

const Colors = {
  light: {
    // Text
    text: colors.gray900,
    textSecondary: colors.gray500,
    textMuted: colors.gray400,

    // Backgrounds
    background: colors.background,
    surface: colors.surface,
    surfaceElevated: colors.surfaceElevated,

    // Brand
    tint: colors.primary,
    primary: colors.primary,
    primaryLight: colors.primaryLight,

    // Accents
    orange: colors.orange,
    emerald: colors.emerald,
    amber: colors.amber,
    indigo: colors.indigo,

    // Tab bar
    tabIconDefault: colors.gray300,
    tabIconSelected: colors.primary,
    tabBarBackground: colors.white,

    // Borders
    border: colors.border,

    // Semantic
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
} as const;

export default Colors;
export type ColorScheme = keyof typeof Colors;
