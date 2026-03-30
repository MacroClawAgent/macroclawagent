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
        // Coastal Sunrise palette
        coastal: {
          warm: "#F5ECE6",
          sand: "#EFD9CC",
          cream: "#FAF4EF",
          white: "#FFFDFB",
          peach: "#F29A69",
          coral: "#E88367",
          sky: "#8FD3F4",
          aqua: "#69BDEB",
          charcoal: "#4A454A",
          muted: "#7C7472",
          border: "#CFC7C2",
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
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(242, 154, 105, 0.30)" },
          "50%": { boxShadow: "0 0 40px rgba(232, 131, 103, 0.50)" },
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
        // Coastal soft glass
        ".glass": {
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          backgroundColor: "rgba(255, 253, 251, 0.70)",
          border: "1px solid rgba(207, 199, 194, 0.50)",
        },
        // Premium warm card glass
        ".glass-card": {
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor: "rgba(250, 244, 239, 0.85)",
          border: "1px solid rgba(207, 199, 194, 0.50)",
          borderRadius: "1.25rem",
        },
        // Heavier warm glass overlay
        ".glass-heavy": {
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          backgroundColor: "rgba(245, 236, 230, 0.92)",
          border: "1px solid rgba(242, 154, 105, 0.20)",
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
              "linear-gradient(90deg, transparent, rgba(242,154,105,0.08), transparent)",
            animation: "shimmer 2s infinite",
          },
        },
        // Gradient text — peach → coral (animated)
        ".gradient-text": {
          background:
            "linear-gradient(135deg, #F29A69 0%, #E88367 40%, #F29A69 70%, #E88367 100%)",
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "gradient-shift 4s ease infinite",
        },
        // Gradient text — sky blue → peach (static, primary highlight)
        ".gradient-text-light": {
          background: "linear-gradient(135deg, #F29A69 0%, #E88367 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
        // Soft coral glow border
        ".glow-border": {
          border: "1px solid rgba(242, 154, 105, 0.40)",
          boxShadow: "0 0 24px rgba(242, 154, 105, 0.12)",
        },
        // Coastal card (white/cream with warm shadow)
        ".light-card": {
          backgroundColor: "#FFFDFB",
          border: "1px solid #E8DDD8",
          borderRadius: "1.25rem",
          boxShadow: "0 2px 12px rgba(74, 69, 74, 0.06), 0 1px 3px rgba(74, 69, 74, 0.04)",
        },
        // Sand card
        ".sand-card": {
          backgroundColor: "#FAF4EF",
          border: "1px solid #CFC7C2",
          borderRadius: "1.25rem",
          boxShadow: "0 2px 8px rgba(74, 69, 74, 0.05)",
        },
      });
    }),
  ],
};

export default config;
