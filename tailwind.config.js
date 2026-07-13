/** @type {import('tailwindcss').Config} */

// Paleta "Salto del Laja": basalto (roca), bosque/cauce (agua verde),
// espuma (blanco del salto), greda→copihue (acento cálido que profundiza a carmín),
// piedra (gris-verde). Se mantienen las llaves lago/arena/volcan para
// retematizar todo el sistema sin tocar cada componente.
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
        // lago → verde basalto / cauce
        lago: {
          50:  '#f0f4f1',
          100: '#dee8e0',
          200: '#c0d2c5',
          300: '#97b4a0',
          400: '#6c9179',
          500: '#4e7560',
          600: '#3c5e4c',
          700: '#314c3f',
          800: '#293d34',
          900: '#22322b',
          950: '#141e19',
        },
        // arena → greda que profundiza a copihue (acento carmín)
        arena: {
          50:  '#f7f5ef',
          100: '#eeeae0',
          200: '#dfd6c6',
          300: '#c7b49e',
          400: '#ad7a60',
          500: '#94443c',
          600: '#7f3232',
          700: '#6a272c',
          800: '#571f26',
          900: '#471a21',
        },
        // volcan → piedra (gris-verde frío para texto secundario)
        volcán: {
          50:  '#f5f6f4',
          100: '#e9ece8',
          200: '#d5dad4',
          300: '#b7bfb8',
          400: '#93a097',
          500: '#78877e',
          600: '#64746b',
          700: '#525f58',
          800: '#444f49',
          900: '#3a433e',
        },
        volcan: {
          50:  '#f5f6f4',
          100: '#e9ece8',
          200: '#d5dad4',
          300: '#b7bfb8',
          400: '#93a097',
          500: '#78877e',
          600: '#64746b',
          700: '#525f58',
          800: '#444f49',
          900: '#3a433e',
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
