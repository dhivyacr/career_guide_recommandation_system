/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ai: {
          bg: "#0B1D33",
          card: "#162A45",
          accent: "#3B82F6",
          text: "#E5E7EB"
        }
      },
      boxShadow: {
        glow: "0 0 24px rgba(59,130,246,0.28)"
      }
    }
  },
  plugins: []
};
