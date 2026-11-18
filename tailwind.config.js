/** @type {import('tailwindcss').Config} */
const blue = {
  50: "#EEF5FC",
  100: "#E3EEF9",
  200: "#C5DCF1",
  300: "#9DC2E6",
  400: "#6FA3D6",
  500: "#4388C8",
  600: "#2F74BA",
  700: "#2B6CB0",
  800: "#1F4E85",
  900: "#163A66",
  950: "#0F2A4B",
};

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Figtree", "system-ui", "Segoe UI", "sans-serif"] },
      colors: {
        ink: "#12263F",
        paper: "#F4F6F8",
        brand: { DEFAULT: "#2B6CB0", dark: "#1F4E85", tint: "#E3EEF9" },
        present: "#15803D",
        absent: "#B91C1C",
        warn: "#B45309",
        // every green-* / emerald-* class renders blue
        green: blue,
        emerald: blue,
      },
    },
  },
  plugins: [],
};