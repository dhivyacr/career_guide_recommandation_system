/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ai: {
          bg: "#0B1D33",
          secondary: "#0F2A47",
          accent: "#3B82F6",
          card: "#162A45",
          text: "#E5E7EB"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(59, 130, 246, 0.25)",
        card: "0 10px 25px rgba(2, 12, 27, 0.45)"
      },
      backgroundImage: {
        "ai-gradient": "linear-gradient(135deg, #0B1D33 0%, #0F2A47 60%, #123764 100%)",
        "button-gradient": "linear-gradient(to right, #3B82F6, #2563EB)",
        "cta-grid": "linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
