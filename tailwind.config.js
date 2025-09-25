/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'riot-gold': '#F0E6D2',
        'riot-blue': '#0596AA',
        'riot-dark': '#010A13',
        'riot-gray': '#1E2328',
        // Official League of Legends Team Colors
        'lol-blue': {
          'dark': '#0F2027',
          'main': '#1E3A8A',
          'accent': '#00F5FF',
          'light': '#3B82F6',
        },
        'lol-red': {
          'dark': '#3C1414', 
          'main': '#991B1B',
          'accent': '#FF6B6B',
          'light': '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}