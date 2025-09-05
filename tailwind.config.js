/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(210, 30%, 95%)',
        accent: 'hsl(160, 70%, 40%)',
        primary: 'hsl(210, 80%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        }
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px'
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px'
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.08)'
      }
    },
  },
  plugins: [],
}