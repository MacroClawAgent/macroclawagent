import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Midnight Athletic palette
        midnight: {
          DEFAULT: "#08090D",
          surface: "#0F111A",
          elevated: "#161925",
        },
        // Shadcn CSS variable mappings
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ring-fill": {
          "0%": { strokeDashoffset: "var(--ring-full)" },
          "100%": { strokeDashoffset: "var(--ring-offset)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundSize: {
        "300%": "300%",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        // Base glass effect
        ".glass": {
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
        },
        // Premium card glass effect
        ".glass-card": {
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor: "rgba(15, 17, 26, 0.80)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "1rem",
        },
        // Stronger glass for overlays
        ".glass-heavy": {
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          backgroundColor: "rgba(8, 9, 13, 0.90)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
        },
        // Shimmer skeleton overlay
        ".skeleton-shimmer": {
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
            animation: "shimmer 2s infinite",
          },
        },
        // Gradient text utility — indigo → violet → blue
        ".gradient-text": {
          background:
            "linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #A78BFA 70%, #6366F1 100%)",
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "gradient-shift 4s ease infinite",
        },
        // Indigo glow border
        ".glow-border": {
          border: "1px solid rgba(99, 102, 241, 0.35)",
          boxShadow: "0 0 24px rgba(99, 102, 241, 0.10)",
        },
      });
    }),
  ],
};

export default config;
