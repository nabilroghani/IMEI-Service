/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#060913',      // Deepest midnight blue-black
          card: '#0c1122',    // Frosted glass background base
          border: '#1b254b',  // Glass border color
          muted: '#8f9bba',   // Muted gray-blue
          text: '#f4f6fa',    // Primary text
        },
        primary: {
          DEFAULT: '#3b82f6', // Electric blue
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
        accent: {
          purple: '#8b5cf6',  // Glow purple
          cyan: '#06b6d4',    // Glow cyan
          emerald: '#10b981', // Glow emerald (Success)
          rose: '#f43f5e',    // Glow rose (Failed)
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glass-glow': '0 8px 32px 0 rgba(6, 182, 212, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.35)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.35)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
