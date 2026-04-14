import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-material-theme-sys-light-primary)",
        "on-primary": "var(--color-material-theme-sys-light-on-primary)",
        secondary: "var(--color-material-theme-sys-light-secondary)",
        "on-secondary": "var(--color-material-theme-sys-light-on-secondary)",
        background: "var(--color-material-theme-sys-light-background)",
        surface: "var(--color-material-theme-sys-light-surface)",
        "surface-variant": "var(--color-material-theme-sys-light-surface-variant)",
        "on-surface": "var(--color-material-theme-sys-light-on-surface)",
        "on-surface-variant": "var(--color-material-theme-sys-light-on-surface-variant)",
        outline: "var(--color-material-theme-sys-light-outline)",
        "outline-variant": "var(--color-material-theme-sys-light-outline-variant)",
        error: "var(--color-material-theme-sys-light-error)",
        "on-error": "var(--color-material-theme-sys-light-on-error)",
        
        // Badges Mappings
        "badge-0": "var(--primitive-colors-2-key-colors-neutral-variant)",
        "badge-1": "var(--primitive-colors-2-color-palette-primary-colors-primary-50)",
        "badge-2": "var(--primitive-colors-2-key-colors-success)",
        "badge-3": "var(--primitive-colors-2-key-colors-warning)",
        "badge-4": "var(--color-material-theme-sys-light-primary)",
      },
    },
  },
  plugins: [],
};
export default config;
