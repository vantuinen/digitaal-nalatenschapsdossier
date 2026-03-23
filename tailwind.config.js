/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  "#f4f4f0",
          100: "#e8e7e0",
          200: "#d0cfc4",
          300: "#b0ae9f",
          400: "#8e8b79",
          500: "#716e5e",
          600: "#5a574a",
          700: "#46443a",
          800: "#312f28",
          900: "#1a1915",
          950: "#0d0c0a",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans:  ["'DM Sans'", "system-ui", "sans-serif"],
        mono:  ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)",
        vault: "0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)",
      }
    },
  },
  plugins: [],
};
