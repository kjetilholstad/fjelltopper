import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        forest: {
          DEFAULT: '#2D5016',
          50: '#f0f5e8',
          100: '#dcebc5',
          200: '#b8d48e',
          600: '#3d6b1f',
          700: '#2D5016',
          800: '#1f3a0f',
        },
        amber: {
          warm: '#8B6914',
          light: '#f5edd6',
        },
        parchment: '#F7F4EF',
        'border-warm': '#E8E2D9',
        'text-warm': '#6B6560',
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
}

export default config
