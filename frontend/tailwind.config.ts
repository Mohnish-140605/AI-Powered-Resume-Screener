import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Obsidian Nexus surface hierarchy
        void: {
          base:    "var(--bg-base)",
          low:     "var(--bg-low)",
          mid:     "var(--bg-mid)",
          high:    "var(--bg-high)",
          highest: "var(--bg-highest)",
        },
        // Legacy space tokens (kept for backward compat)
        space: {
          900: "var(--bg-base)",
          800: "var(--bg-mid)",
          700: "var(--bg-high)",
        },
        // Accent palette
        neon: {
          indigo:  "var(--accent)",
          violet:  "var(--violet)",
          cyan:    "var(--cyan)",
          amber:   "var(--amber)",
          emerald: "var(--emerald)",
          pink:    "var(--red)",
        },
        // Text hierarchy
        ink: {
          high: "var(--text-high)",
          mid:  "var(--text-mid)",
          low:  "var(--text-low)",
          faint:"var(--text-faint)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-cta":   "linear-gradient(135deg, var(--accent), var(--violet))",
        "gradient-title": "linear-gradient(90deg, var(--accent), var(--cyan))",
        "gradient-top":   "linear-gradient(135deg, var(--accent), var(--emerald))",
      },
      boxShadow: {
        "glow-indigo": "0 0 24px rgba(192,193,255,0.25)",
        "glow-cyan":   "0 0 20px rgba(6,182,212,0.30)",
        "glow-violet": "0 0 20px rgba(208,188,255,0.25)",
        "glow-sm":     "0 0 12px rgba(192,193,255,0.20)",
        "ambient":     "0 0 80px rgba(192,193,255,0.04)",
        "card":        "0 4px 24px rgba(0,0,0,0.4)",
        "card-top":    "0 0 0 2px transparent, 0 0 30px rgba(192,193,255,0.15)",
      },
      animation: {
        "spin-slow":    "spin 8s linear infinite",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "breathe":      "breathe 4s ease-in-out infinite",
        "orbit":        "spin 6s linear infinite",
        "orbit-rev":    "spin 9s linear infinite reverse",
        "float-gentle": "float 6s ease-in-out infinite",
        "shimmer":      "shimmer 2.5s linear infinite",
        "fade-up":      "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in":     "slideIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        breathe: {
          "0%,100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":     { opacity: "1",   transform: "scale(1.08)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateY(8px) scale(0.97)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      backdropBlur: {
        xs: "4px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
