/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: 'var(--brand-green)',
          'green-light': 'var(--brand-green-light)',
          'green-dark': 'var(--brand-green-dark)',
          blue: 'var(--brand-blue)',
          mint: 'var(--brand-mint)',
        },
        ink: {
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
          500: 'var(--ink-500)',
        },
        surface: {
          0: 'var(--surface-0)',
          100: 'var(--surface-100)',
          200: 'var(--surface-200)',
          alt: 'var(--surface-alt)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
