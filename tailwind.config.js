/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        lago: {
          50:  '#f0f7f4',
          100: '#dceee8',
          200: '#b9ddd1',
          300: '#8fc5b4',
          400: '#5fa892',
          500: '#3d8c76',
          600: '#2e705e',
          700: '#265a4c',
          800: '#20483d',
          900: '#1b3b32',
          950: '#0e2220',
        },
        arena: {
          50:  '#faf8f3',
          100: '#f3ede0',
          200: '#e8d9c0',
          300: '#d9bf98',
          400: '#c9a06e',
          500: '#bc8a50',
          600: '#ae7745',
          700: '#91603a',
          800: '#754e34',
          900: '#60412c',
        },
        volcán: {
          50:  '#f8f7f6',
          100: '#eeece8',
          200: '#ddd9d2',
          300: '#c5bfb4',
          400: '#a89e91',
          500: '#978c7e',
          600: '#8b7f71',
          700: '#746a5f',
          800: '#605850',
          900: '#504942',
        },
        volcan: {
          50:  '#f8f7f6',
          100: '#eeece8',
          200: '#ddd9d2',
          300: '#c5bfb4',
          400: '#a89e91',
          500: '#978c7e',
          600: '#8b7f71',
          700: '#746a5f',
          800: '#605850',
          900: '#504942',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
