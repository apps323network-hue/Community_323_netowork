/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f425f4',        // Neon Pink
        'primary-hover': '#d920d9',
        secondary: '#00f0ff',      // Neon Cyan
        'secondary-hover': '#00cce6',
        'secondary-dark': '#0891b2', // Darker Cyan (600) for better contrast on light mode
        neonBlue: '#00f0ff',       // Neon Blue/Cyan
        neonPink: '#f425f4',      // Neon Pink
        // Light mode colors
        'background-light': '#f0f2f5', // Standard dashboard gray for better contrast
        'surface-white': '#ffffff',
        'surface-light': '#ffffff', // Added alias for consistency
        // Dark mode colors
        'background-dark': '#050508',
        'surface-dark': '#12121A',
        'surface-lighter': '#1E1E2A',
        'surface-card': '#18181b',
        'border-dark': '#3d183d',
        'input-bg': '#2a1630',
        'input-border': '#4a2550',
        'text-muted': '#a68aa6',
        // Slate colors for light mode
        'slate-850': '#1e293b',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        // Dark mode shadows (glow forte)
        'neon-blue': '0 0 15px rgba(0, 240, 255, 0.4), 0 0 30px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 15px rgba(244, 37, 244, 0.4), 0 0 30px rgba(244, 37, 244, 0.2)',
        'glow-primary': '0 0 20px rgba(244, 37, 244, 0.5)',
        'glow-secondary': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-mixed': '-5px 0 15px rgba(244, 37, 244, 0.2), 5px 0 15px rgba(0, 240, 255, 0.2)',
        // Light mode shadows (sutis e elegantes)
        'light-primary': '0 0 30px -10px rgba(244, 37, 244, 0.25)',
        'light-secondary': '0 0 20px rgba(0, 243, 255, 0.35)',
        'light-card': '0 4px 20px -10px rgba(0, 0, 0, 0.08)',
        'premium': '0 10px 40px -15px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 50px -12px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #f425f4 0%, #00f0ff 100%)',
        'neon-gradient-rev': 'linear-gradient(135deg, #00f0ff 0%, #f425f4 100%)',
      },
      animation: {
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      },
      keyframes: {
        "shimmer-slide": {
          "0%": {
            transform: "translate(-50%, 0)",
          },
          "100%": {
            transform: "translate(50%, 0)",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
      },
    },
  },
  plugins: [],
}

