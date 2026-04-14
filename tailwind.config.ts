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
        "primary-container": "var(--color-material-theme-sys-light-primary-container)",
        "on-primary-container": "var(--color-material-theme-sys-light-on-primary-container)",
        secondary: "var(--color-material-theme-sys-light-secondary)",
        "on-secondary": "var(--color-material-theme-sys-light-on-secondary)",
        "secondary-container": "var(--color-material-theme-sys-light-secondary-container)",
        "on-secondary-container": "var(--color-material-theme-sys-light-on-secondary-container)",
        tertiary: "var(--color-material-theme-sys-light-tertiary)",
        "on-tertiary": "var(--color-material-theme-sys-light-on-tertiary)",
        "tertiary-container": "var(--color-material-theme-sys-light-tertiary-container)",
        "on-tertiary-container": "var(--color-material-theme-sys-light-on-tertiary-container)",
        background: "var(--color-material-theme-sys-light-background)",
        "on-background": "var(--color-material-theme-sys-light-on-background)",
        surface: "var(--color-material-theme-sys-light-surface)",
        "on-surface": "var(--color-material-theme-sys-light-on-surface)",
        "surface-variant": "var(--color-material-theme-sys-light-surface-variant)",
        "on-surface-variant": "var(--color-material-theme-sys-light-on-surface-variant)",
        "surface-container": "var(--color-material-theme-sys-light-surface-container)",
        "surface-container-low": "var(--color-material-theme-sys-light-surface-container-low)",
        "surface-container-high": "var(--color-material-theme-sys-light-surface-container-high)",
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
