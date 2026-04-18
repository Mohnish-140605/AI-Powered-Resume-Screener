import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Obsidian Nexus surface hierarchy
        void: {
          base:    "#0d0d1a",  // deepest — page bg
          low:     "#12121f",  // surface base
          mid:     "#1a1a28",  // cards / panels
          high:    "#292937",  // elevated / hover
          highest: "#343342",  // popovers / focused
        },
        // Legacy space tokens (kept for backward compat)
        space: {
          900: "#0d0d1a",
          800: "#1a1a28",
          700: "#292937",
        },
        // Accent palette
        neon: {
          indigo:  "#c0c1ff",  // primary accent
          violet:  "#d0bcff",  // secondary / AI moments
          cyan:    "#06b6d4",  // high-score indicators
          amber:   "#f59e0b",  // gaps / warnings
          emerald: "#10b981",  // strengths / success
          pink:    "#ffb783",  // tertiary
        },
        // Text hierarchy
        ink: {
          high: "#e3e0f3",   // primary text
          mid:  "#c7c4d7",   // secondary text
          low:  "#8c8a9e",   // muted / placeholders
          faint:"#464554",   // very muted
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-cta":   "linear-gradient(135deg, #8083ff, #d0bcff)",
        "gradient-title": "linear-gradient(90deg, #c0c1ff, #d0bcff)",
        "gradient-top":   "linear-gradient(135deg, #c0c1ff, #06b6d4)",
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
