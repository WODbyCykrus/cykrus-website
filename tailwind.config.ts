import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cykra Mood-Board B — Spline Playful Royal
        cykra: {
          body: '#F5F1E8',         // cremeweiß glossy
          gold: '#E8C76C',         // warmes Gold
          'royal-blue': '#2A3A6E', // Königsblau (Dome unten)
          lavender: '#A088C9',     // Lavendel (Dome mitte)
          ink: '#0E0B14',          // Hintergrund-Schwarz
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cykra-aurora':
          'radial-gradient(circle at 50% 70%, #2A3A6E 0%, #A088C9 60%, #E8C76C 100%)',
      },
      animation: {
        'cykra-float': 'cykra-float 6s ease-in-out infinite',
      },
      keyframes: {
        'cykra-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
