/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          750: "#2D3748",
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out forwards",
        pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        slideInRight: "slideInRight 0.3s ease-out forwards",
        slideInLeft: "slideInLeft 0.3s ease-out forwards",
        scaleIn: "scaleIn 0.2s ease-out forwards",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.900"),
            a: {
              color: theme("colors.blue.600"),
              "&:hover": {
                color: theme("colors.blue.700"),
              },
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.gray.200"),
            a: {
              color: theme("colors.blue.400"),
              "&:hover": {
                color: theme("colors.blue.300"),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        html: { fontSize: "16px" },
      });
    },
  ],
  darkMode: "class",
};
